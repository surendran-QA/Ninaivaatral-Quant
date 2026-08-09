@echo off
echo Starting Ninaivaatral Quant FastAPI Backend...
cd backend
call .venv\Scripts\activate.bat
python -m uvicorn main:app --host 0.0.0.0 --port 8000
