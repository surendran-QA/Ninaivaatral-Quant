import os
import sys
import csv
import httpx
import asyncio

TRAIN_DATA_FILE = r"C:\Surendran\Fixed volume profile with congee\Quantitative_Research\Phase5_Test\train_data.csv"
API_URL = "http://localhost:8000/memory"
# Note: we need a token to post to memory
# We'll login first
LOGIN_URL = "http://localhost:8000/login"

async def main():
    print("Reading training data...")
    if not os.path.exists(TRAIN_DATA_FILE):
        print(f"Error: {TRAIN_DATA_FILE} not found!")
        return

    trades = []
    with open(TRAIN_DATA_FILE, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            trades.append(row)
            
    print(f"Found {len(trades)} training trades.")
    
    async with httpx.AsyncClient() as client:
        # Login
        resp = await client.post(LOGIN_URL, json={"username": "admin", "password": "admin"})
        if resp.status_code != 200:
            print("Login failed!")
            return
        token = resp.json().get("token")
        headers = {"Authorization": f"Bearer {token}"}
        
        print("\n--- STEP 0: Ingest Strategy Blueprint ---")
        blueprint_text = """[STRATEGY BLUEPRINT]
Name: MNQ 55-Minute ORB Breakout (Dynamic Target)
Symbol: MNQ (Nasdaq 100 Micro)
Accumulation Window: 09:30 AM - 10:25 AM EST. Records Highest Price and Lowest Price. At 10:25:00, locks IB_High and IB_Low.
ORB Size: IB_High - IB_Low
Execution Window: 10:26 AM - 16:00 PM EST.
Entry Logic: LONG if price crosses above IB_High. SHORT if price crosses below IB_Low.
Volume Filter: Disabled.
Risk Management: Max 1 trade per day.
Stop Loss (SL): Midpoint of the 55-minute range.
Take Profit (TP): 1.0x the size of the ORB.
"""
        await client.post(API_URL, headers=headers, json={
            "payload": blueprint_text,
            "fields": {"trade_id": "blueprint", "trade_result": "EOD Flatten"}
        })
        print("Added Strategy Blueprint.")
        
        print("\n--- STEP 1: Ingest Training Trades ---")
        for i, row in enumerate(trades):
            trade_payload = f"""[SESSION: {row['trade_id']}]
Strategy: {row['strategy']}
Date: {row['date']}
Symbol: {row['symbol']}
System Bias: {row['direction']}
Entry: {row['entry_price']} @ {row['time']} ET
Exit: {row['exit_price']} @ {row['exit_time']} ET
--- OUTCOME ---
Result: {row['outcome']}
Net PnL: {row['pnl']}
"""
            # We send all trades to memory
            await client.post(API_URL, headers=headers, json={
                "payload": trade_payload,
                "auto_cognify": True if i == len(trades) - 1 else False,
                "fields": {
                    "trade_id": row['trade_id'],
                    "trade_result": "EOD Flatten" if i == len(trades) - 1 else "Pending"
                }
            })
            print(f"Added trade {i+1}/{len(trades)}: {row['trade_id']}")
            
        print("All payloads sent to Backend Queue.")

if __name__ == "__main__":
    asyncio.run(main())
