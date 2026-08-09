import os
import csv
import httpx
import asyncio
import json

TEST_PRE_FILE = r"C:\Surendran\Fixed volume profile with congee\Quantitative_Research\Phase5_Test\test_data_pre.csv"
API_URL = "http://localhost:8000/analyze"
LOGIN_URL = "http://localhost:8000/login"

async def main():
    if not os.path.exists(TEST_PRE_FILE):
        print(f"Error: {TEST_PRE_FILE} not found!")
        return

    trades = []
    with open(TEST_PRE_FILE, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            trades.append(row)
            
    async with httpx.AsyncClient() as client:
        resp = await client.post(LOGIN_URL, json={"username": "admin", "password": "admin"})
        if resp.status_code != 200:
            print("Login failed!")
            return
        token = resp.json().get("token")
        headers = {"Authorization": f"Bearer {token}"}
        
        # Send only the first 2 trades as "pre-trade" setup analysis
        for row in trades[:2]:
            payload = f"""[MORNING SETUP: {row['trade_id']}]
Strategy: {row['strategy']}
Date: {row['date']}
Symbol: {row['symbol']}
System Bias: {row['direction']}
Entry: {row['entry_price']} @ {row['time']} ET
"""
            print(f"Sending trade {row['trade_id']} for analysis...")
            resp = await client.post(API_URL, headers=headers, json={
                "payload": payload,
                "fields": {
                    "trade_id": row['trade_id'],
                    "strategy": row['strategy'],
                    "date": row['date'],
                    "direction": row['direction'],
                    "entry_price": row['entry_price'],
                    "time": row['time']
                }
            })
            print(f"Response: {resp.status_code}")
            print(json.dumps(resp.json(), indent=2))

if __name__ == "__main__":
    asyncio.run(main())
