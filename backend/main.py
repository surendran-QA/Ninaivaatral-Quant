import asyncio
from fastapi import FastAPI, Request, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import glob
import json
import uuid
import httpx
from datetime import datetime
import console_ui
from queue_manager import payload_queue, background_worker, INGESTION_DIR
from llm_service import analyze_setup_payload, save_failed_payload
from auth import verify_token, create_access_token
import os
import state_manager

ARCHIVE_DIR = "ArchivedPayloads"
os.makedirs(ARCHIVE_DIR, exist_ok=True)

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    console_ui.print_logo()
    
    pending_files = glob.glob(f"{INGESTION_DIR}/*.json")
    for file in pending_files:
        await payload_queue.put(file)
    if pending_files:
        print(f"[Startup] Recovered {len(pending_files)} pending payloads from disk!")
        
    asyncio.create_task(background_worker())
    yield

app = FastAPI(title="Ninaivaatral Quant - Cognee Integration", lifespan=lifespan)

# Add CORS for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class LoginRequest(BaseModel):
    username: str
    password: str

@app.post("/login")
async def login(req: LoginRequest):
    valid_user = os.getenv("ADMIN_USERNAME", "admin")
    valid_pass = os.getenv("ADMIN_PASSWORD", "admin")
    
    if req.username == valid_user and req.password == valid_pass:
        token = create_access_token({"sub": req.username})
        return {"success": True, "token": token}
    raise HTTPException(status_code=401, detail="Invalid credentials")

@app.get("/health")
async def health_check():
    litellm_status = "offline"
    try:
        # Check LiteLLM via health endpoint
        async with httpx.AsyncClient(timeout=2.0) as client:
            resp = await client.get("http://litellm:4000/health")
            if resp.status_code == 200:
                litellm_status = "online"
    except Exception:
        # For local development where litellm might be localhost or not named 'litellm'
        try:
            async with httpx.AsyncClient(timeout=2.0) as client:
                resp = await client.get("http://localhost:4000/health")
                if resp.status_code == 200:
                    litellm_status = "online"
        except Exception:
            pass

    return {"backend": "online", "litellm": litellm_status}

@app.get("/history", dependencies=[Depends(verify_token)])
async def get_history():
    history = []
    if not os.path.exists(ARCHIVE_DIR):
        return history
        
    files = sorted(glob.glob(f"{ARCHIVE_DIR}/Analyze_*.json"), reverse=True)
    for f in files[:20]: # Return last 20
        try:
            with open(f, "r") as file:
                data = json.load(file)
                # Ensure the history structure matches what the UI expects
                history.append({
                    "id": os.path.basename(f),
                    "timestamp": datetime.fromtimestamp(os.path.getctime(f)).isoformat(),
                    "confidence_score": data.get("response", {}).get("confidence_score", 0),
                    "historical_win_rate": data.get("response", {}).get("historical_win_rate", 0),
                    "status": "Success" if data.get("response") else "Pending"
                })
        except Exception:
            pass
    return history

@app.post("/memory", dependencies=[Depends(verify_token)])
async def add_memory(request: Request):
    """
    Receives JSON payload from the Quantower C# Indicator, 
    adds it to the graph, and immediately cognifies it.
    """
    try:
        data = await request.json()
        payload = data.get("payload")
        fields = data.get("fields")
        
        # L2 Idempotency Bouncer
        session_id = fields.get("session_id") if fields else None
        if session_id:
            processed_file = "Processed_Sessions.txt"
            if os.path.exists(processed_file):
                with open(processed_file, "r") as f:
                    processed_ids = set(line.strip() for line in f)
                if session_id in processed_ids:
                    print(f"\n[!] Bouncer Blocked Duplicate /memory payload for {session_id}")
                    return {"status": "error", "message": f"Duplicate session_id detected: {session_id}. Payload rejected to protect graph."}
            
            with open(processed_file, "a") as f:
                f.write(f"{session_id}\n")
                
        # M4 Quantitative Math Ledger
        if fields:
            ledger_file = "Quantitative_Trade_Log.jsonl"
            with open(ledger_file, "a") as f:
                f.write(json.dumps(fields) + "\n")
        
        # Archiving (Batch 1 feature)
        archive_file = f"{ARCHIVE_DIR}/Memory_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}.json"
        with open(archive_file, "w") as f:
            json.dump(data, f)
            
        if not payload:
            return {"status": "error", "message": "No payload provided"}
            
        filename = f"{INGESTION_DIR}/payload_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}.json"
        with open(filename, "w") as f:
            json.dump(data, f)
            
        await payload_queue.put(filename)
        
        return {"status": "success", "message": "Payload securely queued for processing."}
        
    except Exception as e:
        print(f"Error queueing memory: {str(e)}")
        return {"status": "error", "message": str(e)}

analyze_counter = 0

@app.post("/analyze", dependencies=[Depends(verify_token)])
async def analyze_setup(request: Request):
    """
    Receives Morning Setup JSON payload from Indicator at 10:00 AM, 
    queries the graph for AI Score, and queues the payload for background cognification.
    """
    global analyze_counter
    try:
        data = await request.json()
        payload = data.get("payload")
        
        # Archiving (Batch 1 feature)
        archive_file = f"{ARCHIVE_DIR}/Analyze_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}.json"
        with open(archive_file, "w") as f:
            json.dump(data, f)
            
        if not payload:
            return {"status": "error", "message": "No payload provided"}
            
        analyze_counter += 1
        print("\n" + "="*60)
        print(f">>> [PAYLOAD {analyze_counter}] ACTIVE ANALYSIS REQUEST RECEIVED")
        print("="*60)
        print(payload)
        print("="*60)
        
        response = await analyze_setup_payload(payload, payload_queue, INGESTION_DIR)
        
        # Save response back to archive file so /history can read it
        data["response"] = response
        with open(archive_file, "w") as f:
            json.dump(data, f)
            
        # Handle Continuous Learning Pending State
        fields = data.get("fields", {})
        if fields:
            trade_id = fields.get("trade_id")
            strategy = fields.get("strategy")
            date_val = fields.get("date")
            direction = fields.get("direction")
            entry_price = fields.get("entry_price")
            time_val = fields.get("time")
            if trade_id:
                state_manager.add_pending_trade(trade_id, strategy, date_val, direction, entry_price, time_val)
            
        return response
        
    except Exception as e:
        print(f"Error analyzing setup: {str(e)}")
        if 'payload' in locals() and payload:
            save_failed_payload(payload, "analyze")
        return {"status": "error", "message": str(e), "win_probability": "50", "error_flag": True}

@app.get("/pending_trades", dependencies=[Depends(verify_token)])
async def get_pending_trades():
    return state_manager.get_pending_trades()

class DeleteTradesRequest(BaseModel):
    trade_ids: list[str]

@app.delete("/pending_trades", dependencies=[Depends(verify_token)])
async def delete_pending_trades(req: DeleteTradesRequest):
    success = state_manager.delete_pending_trades(req.trade_ids)
    if success:
        return {"status": "success", "message": f"Deleted {len(req.trade_ids)} trades"}
    raise HTTPException(status_code=400, detail="Could not delete some or all trades")

class ResolveTradeRequest(BaseModel):
    trade_id: str
    exit_time: str
    exit_price: float
    pnl: float
    outcome: str

@app.post("/resolve_trade", dependencies=[Depends(verify_token)])
async def resolve_trade(req: ResolveTradeRequest):
    trade = state_manager.resolve_pending_trade(req.trade_id)
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found or already resolved")
        
    # Construct the final Training Payload
    trade_payload = f"""[SESSION: {trade['trade_id']}]
Strategy: {trade['strategy']}
Date: {trade['date']}
Symbol: MNQ
System Bias: {trade['direction']}
Entry: {trade['entry_price']} @ {trade['time']} ET
Exit: {req.exit_price} @ {req.exit_time} ET
--- OUTCOME ---
Result: {req.outcome}
Net PnL: {req.pnl}
"""
    
    # Save to ingestion queue
    filename = f"{INGESTION_DIR}/resolved_{trade['trade_id']}_{uuid.uuid4().hex[:8]}.json"
    
    data_to_save = {
        "payload": trade_payload,
        "fields": {
            "trade_id": trade['trade_id'],
            "trade_result": "EOD Flatten" # Trigger cognify
        }
    }
    
    with open(filename, "w") as f:
        json.dump(data_to_save, f)
        
    await payload_queue.put(filename)
    
    return {"status": "success", "message": "Trade resolved and queued for Continuous Learning!"}

if __name__ == "__main__":
    print("Starting Ninaivaatral Quant Backend on http://0.0.0.0:8000...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
