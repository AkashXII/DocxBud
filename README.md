# DocXBud 

An AI-powered study assistant that transforms your lecture notes into an interactive learning experience using a multi-node LangGraph agentic pipeline.

## Demo
 [Watch Demo](https://www.loom.com/share/884bee6ce0c74a7abb9f9db93db71021)

## Features
- **Chat with your notes** — Upload any PDF and ask questions grounded strictly in your document using multi-query RAG
- **Flashcards** — AI-generated flip cards covering key concepts from your material
- **Quiz** — MCQ quiz with instant feedback, scoring, and full answer review
- **Summary** — Structured document summary with overview, key concepts, topics, and important details
- **Chat History** — All conversations persisted and resumable across sessions
- **Auth** — JWT-based register/login with bcrypt password hashing

## Tech Stack
| Layer | Tech |
|---|---|
| Frontend | React + Vite + TailwindCSS |
| Backend | FastAPI (Python) |
| AI Agent | LangGraph + LangChain |
| Retrieval | Multi-query RAG with LLM query expansion |
| Embeddings | sentence-transformers (all-MiniLM-L6-v2) |
| Vector Store | FAISS |
| LLM | Groq (llama-3.1-8b-instant) |
| Database | MongoDB Atlas |
| Auth | JWT (python-jose + bcrypt) |
| Rate Limiting | slowapi |

## Architecture

The core AI pipeline is a LangGraph graph with conditional routing:
```
Upload PDF → Chunk text → Generate embeddings → Store in FAISS
                                                      ↓
User Query → Multi-Query Expansion (LLM generates 3 query variations)
                      ↓
            Retrieve chunks for each query → Deduplicate → Merge
                      ↓
                 LangGraph Router
                /    |      |     \
              QA  Cards   Quiz  Summary
                \    |      |     /
                 Groq LLM Generation
                      ↓
              MongoDB (persist chat history)
```

**Multi-query retrieval** — instead of a single vector search, the system generates 3 variations of the user's question and retrieves chunks for each, then deduplicates and merges. This significantly improves cross-topic answers (e.g. "compare X and Y").

## Running Locally

### Prerequisites
- Python 3.11+
- Node.js 18+
- MongoDB Atlas account (free)
- Groq API key (free)

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables
Create `backend/.env`:
```
GROQ_API_KEY=your_groq_api_key
MONGODB_URL=your_mongodb_connection_string
SECRET_KEY=your_jwt_secret_key
```

## API Endpoints
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | /auth/register | Create account | No |
| POST | /auth/login | Login | No |
| GET | /auth/me | Current user | Yes |
| POST | /upload | Upload PDF | Yes |
| GET | /documents | User's documents | Yes |
| POST | /ask | Chat with document | Yes |
| GET | /messages/{id} | Chat history | Yes |
| POST | /flashcards | Generate flashcards | Yes |
| POST | /quiz | Generate MCQ quiz | Yes |
| POST | /summary | Generate summary | Yes |

## Key Technical Decisions
- **LangGraph over simple LLM calls** — stateful agent graph enables clean conditional routing across 4 modes with shared state
- **Multi-query RAG** — LLM-generated query expansion improves retrieval for comparative and cross-topic questions
- **FAISS over cloud vector DB** — lightweight, runs locally, no additional service dependency for the vector store
- **Groq over OpenAI** — fully free tier, no credit card required, fast inference suitable for real-time chat
- **MongoDB Atlas** — always-on free tier (no inactivity pause), flexible document model suits chat history storage
