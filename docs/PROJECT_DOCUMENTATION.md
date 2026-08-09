# Ninaivaatral Quant: Project Documentation

**Tagline:** Memory-Powered Trading Intelligence
**Repository:** `Ninaivaatral-Quant`
**Architecture:** 3-Tier SaaS (React Frontend, FastAPI Backend, LiteLLM Proxy)
**Deployment Target:** Zerops Container Infrastructure

---

## 1. System Architecture

The application is structured into three isolated, containerized services:

### A. Frontend (Nginx Static)
A high-end, responsive web dashboard built with React.
- **Path:** `/frontend`
- **Role:** Presents the UI, handles admin authentication via JWT, displays the skeuomorphic hero section, and visualizes AI insights using an interactive radial gauge.

### B. Backend API (FastAPI)
A Python web service that acts as the core orchestration engine.
- **Path:** `/backend`
- **Role:** Handles incoming HTTP requests, secures routes using JWT tokens, queues trading payloads into local JSON files, processes data through the Cognee Knowledge Graph, and pings the LLM proxy for inference.

### C. LiteLLM Proxy (Python)
An LLM gateway ensuring correct model routing.
- **Path:** `/litellm`
- **Role:** Routes all text generation requests to `gemini-2.5-flash` and all embedding requests securely to `gemini-embedding-2`.

---

## 2. Feature to Technology Mapping

To ensure absolute clarity on how the tech stack maps to our actual application features, here is the explicit breakdown of tools used per feature:

| Feature Area | Specific Functionality | Technology / Tool Used |
|---|---|---|
| **Frontend User Interface** | Component Framework & Scaffolding | **React 18 + Vite** |
| | Visual Design & Styling | **Vanilla CSS 3** (Custom Glassmorphism, CSS Variables) |
| | Iconography & Graphics | **Lucide React** (Icons) + SVG (Radial Gauges) |
| | HTTP Client (API Calls) | **Native Browser `fetch` API** |
| | Hero Section & UI Assets | AI Generated Skeuomorphic Image (Midjourney/Deepmind Style) |
| **Backend API Server** | Core Web Server & Routing | **FastAPI + Uvicorn** |
| | Admin Security & Auth | **PyJWT** (Token-based Authentication) |
| | HTTP Client (Pinging LiteLLM) | **httpx** (Async HTTP client) |
| **AI Knowledge Graph** | Graph Storage & Embeddings | **Cognee** (Local SQLite & Vector Storage) |
| | Prompting & Inference | **OpenAI Python SDK** (AsyncOpenAI client) |
| | Request Proxying & Keys | **LiteLLM** (Router for `gemini-2.5-flash` & `gemini-embedding-2`) |
| **Background Processing** | Asynchronous Task Queue | **Python `asyncio.Queue`** |
| | Data Ingestion | Standard Python `json` + `os` file handling |
| **Deployment / CI** | Infrastructure Definition | **zerops.yml** |

---

## 3. Directory Structure

```text
Zerops_Hackathon/
├── frontend/                     # React Vite Project
│   ├── src/
│   │   ├── api/client.js         # API integration layer
│   │   ├── assets/               # Hero UI images
│   │   ├── components/           # UI Components (Header, Result, History)
│   │   ├── index.css             # Glassmorphism Design System
│   │   └── App.jsx               # Application root
├── backend/                      # Python FastAPI Project
│   ├── main.py                   # API router and endpoints
│   ├── auth.py                   # JWT generation and verification
│   ├── llm_service.py            # Cognee Graph logic & OpenAI API calls
│   ├── queue_manager.py          # Background worker queue processing
│   └── .env.example              # Environment variables template
├── litellm/                      # Python LiteLLM Router Project
│   ├── router_config.yaml        # Model mapping (flash, embedding-2)
│   └── requirements.txt
└── zerops.yml                    # CI/CD deployment configuration
```

---

## 4. Environment Variables

For local development and Zerops deployment, the following variables must be configured in the `backend/.env` file:

```env
# Admin Auth
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin
JWT_SECRET=super_secret_key_change_in_prod

# Cognee / LiteLLM Settings
OPENAI_BASE_URL=http://localhost:4000
OPENAI_API_KEY=sk-1234
LLM_PROVIDER=openai
EMBEDDING_PROVIDER=openai

# Cognee Database Location
DATA_ROOT_DIRECTORY=./cognee_data
```
