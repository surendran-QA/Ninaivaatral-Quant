import asyncio
import os
import json
import time
import logging
from datetime import datetime
import uuid
from llm_service import process_memory_payload, save_failed_payload

payload_queue = asyncio.Queue()
INGESTION_DIR = "IngestionQueue"
os.makedirs(INGESTION_DIR, exist_ok=True)

async def background_worker():
    logging.info("[Background Worker] Started and listening for payloads...")
    payload_counter = 0
    last_processed = 0.0
    
    while True:
        filepath = await payload_queue.get()
        payload_counter += 1
        logging.info(f"POST-TRADE MEMORY INGESTION STARTED (Payload #{payload_counter})")
        logging.info(f"[Background Worker] Processing file: {filepath}")
        
        payload = None
        try:
            if not os.path.exists(filepath):
                logging.warning(f"[Background Worker] File {filepath} not found. Skipping.")
                payload_queue.task_done()
                continue
                
            with open(filepath, "r") as f:
                data = json.load(f)
                
            payload = data.get("payload")
            auto_cognify = data.get("auto_cognify", False)
            fields = data.get("fields")
            
            await process_memory_payload(payload, auto_cognify, payload_counter, fields)
            
            try:
                os.remove(filepath)
            except PermissionError:
                logging.warning(f"[Background Worker] File Lock Detected: Cannot delete {filepath} right now. Bypassing safely.")
                
        except Exception as e:
            logging.error(f"[Background Worker] Error processing memory: {str(e)}", exc_info=True)
            if payload:
                save_failed_payload(payload, "memory")
            if os.path.exists(filepath):
                try:
                    os.remove(filepath)
                except PermissionError:
                    logging.warning(f"[Background Worker] File Lock Detected: Cannot delete {filepath} right now. Bypassing safely.")
        
        payload_queue.task_done()
        
        time_since_last = time.time() - last_processed
        if time_since_last < 60.0:
            sleep_time = 60.0 - time_since_last
            logging.info(f"[Background Worker] RPM Limit approaching. Dynamic pacing: sleeping for {sleep_time:.1f}s...")
            await asyncio.sleep(sleep_time)
            
        last_processed = time.time()
        logging.info("[Background Worker] Ready for next payload (Listening via Queue Event)...")
