import os
import asyncio
import json
import uuid
from datetime import datetime
import cognee
from cognee.api.v1.search import SearchType
import openai
from dotenv import load_dotenv
import logging
import time

load_dotenv()

llm_client = openai.AsyncOpenAI(
    api_key=os.getenv("OPENAI_API_KEY", "sk-1234"),
    base_url=os.getenv("OPENAI_BASE_URL", "http://127.0.0.1:4000")
)

def save_failed_payload(payload: str, endpoint: str):
    os.makedirs("FailedPayloads", exist_ok=True)
    filename = f"FailedPayloads/failed_{endpoint}_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}.txt"
    with open(filename, "w") as f:
        f.write(payload)
    logging.error(f"ULTIMATE FALLBACK TRIGGERED: Payload safely written to {filename}")

async def process_memory_payload(payload: str, auto_cognify: bool, payload_counter: int, fields: dict = None):
    logging.info("Injecting Raw Payload into Cognee Memory Engine...")
    
    await cognee.add(payload, dataset_name="nq_live_trades")
    
    is_eod = False
    if fields and fields.get("trade_result") == "EOD Flatten":
        is_eod = True

    if auto_cognify and is_eod:
        logging.info("End of Day Detected! Batch Cognifying the entire day's dataset...")
        await cognee.cognify()
        logging.info("Trade Data Successfully Extracted into AI Knowledge Graph!")
    elif auto_cognify and not is_eod:
        logging.info("Skipping Cognify (Delayed until End of Day EOD Flatten).")
    else:
        logging.info("Skipping Cognify (auto_cognify disabled).")
        
    logging.info(f"[Background Worker] Payload {payload_counter} received | data processing Completed")

async def analyze_setup_payload(payload: str, payload_queue: asyncio.Queue, INGESTION_DIR: str):
    logging.info("Querying Knowledge Graph for Similar Historical Outcomes...")
    
    search_query = (
        "Find historical trading sessions with similar structural states to this payload. "
        "Look for matching Profile Shapes and similar Value Area/POC placement. "
        "Retrieve the final trade Result (e.g. SL Hit, TP Hit) and Exit Reason for those matches. "
        f"Current Payload Context: {payload}"
    )
    
    start_search = time.perf_counter()
    try:
        search_task = asyncio.create_task(cognee.search(query_text=search_query, query_type=SearchType.CHUNKS))
        cognee_results = await asyncio.wait_for(search_task, timeout=15.0)
    except asyncio.TimeoutError:
        logging.error("LLM Search Timed Out (>15s). Slaughtering zombie task.")
        search_task.cancel()
        
        return {
            "status": "error", 
            "confidence_score": 0, 
            "historical_win_rate": 0,
            "narrative": "LLM Latency Timeout. Brain Offline.",
            "error_flag": True
        }
    except Exception as search_err:
        logging.error(f"Cognee Search Failed: {str(search_err)}", exc_info=True)
        search_task.cancel()
        
        return {
            "status": "error", 
            "confidence_score": 0, 
            "historical_win_rate": 0,
            "narrative": f"Graph Error: {str(search_err)}. Brain Offline.",
            "error_flag": True
        }

    search_duration = (time.perf_counter() - start_search)

    similar_sessions_count = len(cognee_results) if cognee_results else 0

    if not cognee_results:
        logging.warning("Cognee Search: Insufficient Historical Data (Triggering Cold Start).")
        return {
            "status": "success", 
            "confidence_score": 0, 
            "historical_win_rate": 0,
            "narrative": "Insufficient Historical Data. Cold Start.",
            "suggested_bias": "NEUTRAL",
            "key_risk": "No Historical Match",
            "pattern_notes": "Awaiting more data.",
            "similar_sessions_count": 0,
            "execution_time": round(search_duration, 2)
        }
        
    condensed_results = []
    if os.getenv("OPTIMIZE_TOKENS", "False").lower() == "true":
        logging.info("Token Optimization Enabled: Running feature-extraction on search results.")
        for res in cognee_results:
            res_str = str(res)
            shape = "N/A"
            bias = "N/A"
            result = "N/A"
            exit_reason = "N/A"
            
            for line in res_str.split('\n'):
                line_lower = line.lower()
                if "profile shape:" in line_lower:
                    shape = line.split(":")[-1].strip()
                elif "system bias:" in line_lower:
                    bias = line.split(":")[-1].strip()
                elif "result:" in line_lower:
                    result = line.split(":")[-1].strip()
                elif "exit reason:" in line_lower:
                    exit_reason = line.split(":")[-1].strip()
            
            condensed = f"Shape: {shape} | Bias: {bias} | Result: {result} | Exit: {exit_reason}"
            condensed_results.append(condensed)
    else:
        logging.info("Token Optimization Disabled: Passing baseline 500-char text slices.")
        for res in cognee_results:
            res_str = str(res)
            outcome_lines = []
            for line in res_str.split('\n'):
                if "Result:" in line or "Exit Reason:" in line:
                    outcome_lines.append(line.strip())
            condensed = res_str[:500]
            if outcome_lines:
                condensed += "\n[Extracted Outcome: " + " | ".join(outcome_lines) + "]"
            condensed_results.append(condensed)

    optimized_context = " | ".join(condensed_results)
    
    if not optimized_context.strip():
        logging.warning("Extracted context is empty. Triggering Cold Start Fail-Safe.")
        return {
            "status": "success", 
            "confidence_score": 0, 
            "historical_win_rate": 0,
            "narrative": "Insufficient Historical Data. Cold Start.",
            "suggested_bias": "NEUTRAL",
            "key_risk": "No Match",
            "pattern_notes": "None",
            "similar_sessions_count": 0,
            "execution_time": round(search_duration, 2)
        }
    
    ai_provider = os.getenv("LLM_PROVIDER", "Gemini").capitalize()
    logging.info(f"{ai_provider} AI Analyzing Historical Outcomes & Calculating Probabilities...")
    
    try:
        response_coro = llm_client.chat.completions.create(
            model="openai/gpt-4o-mini",  # Matches our LiteLLM generation route
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": (
                    "You are a quantitative trading AI. Analyze the historical graph facts provided. "
                    "Determine the overall success rate based on past Results (e.g. SL Hit = Loss, TP Hit = Win). "
                    "Calculate a Historical Win Rate (0-100) and a Confidence Score (0-100). "
                    "Determine a suggested_bias (LONG, SHORT, or NEUTRAL). "
                    "Identify a key_risk (e.g., 'SL cluster @29200'). "
                    "Summarize pattern_notes (e.g., 'b-Shape + high vol at POC'). "
                    "Return strict JSON: {\"confidence_score\": 80, \"historical_win_rate\": 60, \"suggested_bias\": \"LONG\", \"key_risk\": \"...\", \"pattern_notes\": \"...\", \"narrative\": \"brief explanation\"}"
                )},
                {"role": "user", "content": f"Graph Results:\n{optimized_context}"}
            ],
            timeout=15.0
        )
        
        response = await asyncio.wait_for(response_coro, timeout=15.0)
        ai_evaluation = json.loads(response.choices[0].message.content)
        
        confidence_score = int(ai_evaluation.get("confidence_score", 50))
        historical_win_rate = int(ai_evaluation.get("historical_win_rate", 50))
        suggested_bias = str(ai_evaluation.get("suggested_bias", "NEUTRAL")).upper()
        key_risk = str(ai_evaluation.get("key_risk", "Unknown Risk"))
        pattern_notes = str(ai_evaluation.get("pattern_notes", "Unknown Pattern"))
        narrative = str(ai_evaluation.get("narrative", "Evaluation successful."))
        
        total_time = (time.perf_counter() - start_search)
        
        return {
            "status": "Success", 
            "confidence_score": confidence_score, 
            "historical_win_rate": historical_win_rate,
            "suggested_bias": suggested_bias,
            "key_risk": key_risk,
            "pattern_notes": pattern_notes,
            "narrative": narrative,
            "similar_sessions_count": similar_sessions_count,
            "execution_time": round(total_time, 2)
        }
        
    except Exception as llm_err:
        logging.error(f"LLM Evaluation Failed (Timeout or Parsing Error): {str(llm_err)}", exc_info=True)
        return {
            "status": "error", 
            "confidence_score": 0, 
            "historical_win_rate": 0,
            "narrative": "LLM Evaluation Failure. Brain Offline.",
            "error_flag": True
        }
