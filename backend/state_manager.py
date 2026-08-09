import json
import os
from datetime import datetime

PENDING_TRADES_FILE = "cognee_data/pending_trades.json"

def _ensure_file():
    os.makedirs(os.path.dirname(PENDING_TRADES_FILE), exist_ok=True)
    if not os.path.exists(PENDING_TRADES_FILE):
        with open(PENDING_TRADES_FILE, "w") as f:
            json.dump([], f)

def get_pending_trades():
    _ensure_file()
    try:
        with open(PENDING_TRADES_FILE, "r") as f:
            return json.load(f)
    except Exception:
        return []

def add_pending_trade(trade_id: str, strategy: str, date: str, direction: str, entry_price: float, time: str):
    trades = get_pending_trades()
    
    # Deduplication check
    if any(t["trade_id"] == trade_id for t in trades):
        return False
        
    trades.append({
        "trade_id": trade_id,
        "strategy": strategy,
        "date": date,
        "direction": direction,
        "entry_price": entry_price,
        "time": time,
        "status": "Waiting for Post-Trade Data",
        "added_at": datetime.now().isoformat()
    })
    
    with open(PENDING_TRADES_FILE, "w") as f:
        json.dump(trades, f, indent=4)
    return True

def resolve_pending_trade(trade_id: str):
    trades = get_pending_trades()
    trade = next((t for t in trades if t["trade_id"] == trade_id), None)
    
    if trade:
        trades = [t for t in trades if t["trade_id"] != trade_id]
        with open(PENDING_TRADES_FILE, "w") as f:
            json.dump(trades, f, indent=4)
        return trade
    return None

def delete_pending_trades(trade_ids: list):
    trades = get_pending_trades()
    filtered_trades = [t for t in trades if t["trade_id"] not in trade_ids]
    
    if len(filtered_trades) < len(trades):
        with open(PENDING_TRADES_FILE, "w") as f:
            json.dump(filtered_trades, f, indent=4)
        return True
    return False
