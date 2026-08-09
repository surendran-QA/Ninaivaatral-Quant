@echo off
echo Starting LiteLLM Gateway...
cd litellm
call .venv\Scripts\activate.bat
litellm --config router_config.yaml --port 4000
