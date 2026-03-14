from fastapi import FastAPI, UploadFile, File, HTTPException,Depends,Request
from fastapi.middleware.cors import CORSMiddleware
from auth import hash_password, verify_password, create_token, get_current_user
from database import users_collection, documents_collection, messages_collection
from bson import ObjectId
from datetime import datetime
from pydantic import BaseModel
from processor import chunk_text, build_vector_store, search_vector_store
from agent import run_qa, run_flashcards,run_quiz,run_summary
import fitz
import uuid
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi.responses import JSONResponse
limiter = Limiter(key_func=get_remote_address)
app = FastAPI()
app.state.limiter = limiter

@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request, exc):
    return JSONResponse(status_code=429, content={"detail": "Too many requests, slow down!"})
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173","https://*.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
class RegisterRequest(BaseModel):
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str
@app.get("/health")
def health_check():
    return {"status": "ok", "message": "StudyBuddy backend is running!"}

@app.post("/upload")
async def upload_pdf(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user)
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")

    contents = await file.read()
    pdf_doc = fitz.open(stream=contents, filetype="pdf")
    extracted_text = ""
    for page in pdf_doc:
        extracted_text += page.get_text()
    page_count = len(pdf_doc)
    pdf_doc.close()

    if not extracted_text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from PDF")

    chunks = chunk_text(extracted_text)
    session_id = str(uuid.uuid4())
    build_vector_store(chunks, session_id)

    # Save to MongoDB
    doc = {
        "user_id": current_user["_id"],
        "filename": file.filename,
        "session_id": session_id,
        "word_count": len(extracted_text.split()),
        "page_count": page_count,
        "chunk_count": len(chunks),
        "created_at": datetime.utcnow()
    }
    result = documents_collection.insert_one(doc)

    return {
        "filename": file.filename,
        "word_count": len(extracted_text.split()),
        "page_count": page_count,
        "chunk_count": len(chunks),
        "session_id": session_id,
        "document_id": str(result.inserted_id)
    }

@app.post("/search")
async def search(payload: dict):
    """Test endpoint to verify RAG retrieval is working."""
    session_id = payload.get("session_id")
    query = payload.get("query")

    if not session_id or not query:
        raise HTTPException(status_code=400, detail="session_id and query are required")

    results = search_vector_store(session_id, query)
    return {"query": query, "results": results}

@app.post("/ask")
@limiter.limit("10/minute")
async def ask_question(
    request: Request,
    payload: dict,
    current_user=Depends(get_current_user)
):
    session_id = payload.get("session_id")
    query = payload.get("query")
    document_id = payload.get("document_id")

    if not session_id or not query:
        raise HTTPException(status_code=400, detail="session_id and query are required")

    answer = run_qa(session_id, query)

    # Save chat messages to MongoDB
    if document_id:
        messages_collection.insert_many([
            {
                "user_id": current_user["_id"],
                "document_id": ObjectId(document_id),
                "role": "user",
                "content": query,
                "created_at": datetime.utcnow()
            },
            {
                "user_id": current_user["_id"],
                "document_id": ObjectId(document_id),
                "role": "assistant",
                "content": answer,
                "created_at": datetime.utcnow()
            }
        ])

    return {"query": query, "answer": answer}
@app.post("/flashcards")
@limiter.limit("5/minute")
async def generate_flashcards(request: Request,payload: dict,current_user=Depends(get_current_user)):
    session_id = payload.get("session_id")
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id is required")

    flashcards = run_flashcards(session_id)
    return {"flashcards": flashcards}
@app.post("/quiz")
@limiter.limit("5/minute")
async def generate_quiz(request: Request,payload: dict,current_user=Depends(get_current_user)):
    session_id = payload.get("session_id")
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id is required")

    quiz = run_quiz(session_id)
    return {"quiz": quiz}
@app.post("/summary")
@limiter.limit("5/minute")
async def generate_summary(request: Request,payload: dict, current_user=Depends(get_current_user)):
    session_id = payload.get("session_id")
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id is required")

    summary = run_summary(session_id)
    return {"summary": summary}
@app.post("/auth/register")
def register(body: RegisterRequest):
    if users_collection.find_one({"email": body.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    if len(body.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    user = {
        "email": body.email,
        "password_hash": hash_password(body.password),
        "created_at": datetime.utcnow()
    }
    result = users_collection.insert_one(user)
    token = create_token(str(result.inserted_id))
    return {"token": token, "email": body.email}

@app.post("/auth/login")
def login(body: LoginRequest):
    user = users_collection.find_one({"email": body.email})
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_token(str(user["_id"]))
    return {"token": token, "email": user["email"]}

@app.get("/auth/me")
def me(current_user=Depends(get_current_user)):
    return {"email": current_user["email"], "id": str(current_user["_id"])}
@app.get("/documents")
def get_documents(current_user=Depends(get_current_user)):
    docs = list(documents_collection.find(
        {"user_id": current_user["_id"]},
        sort=[("created_at", -1)]  # newest first
    ))
    for doc in docs:
        doc["_id"] = str(doc["_id"])
        doc["user_id"] = str(doc["user_id"])
    return {"documents": docs}

@app.get("/messages/{document_id}")
def get_messages(document_id: str, current_user=Depends(get_current_user)):
    msgs = list(messages_collection.find(
        {"document_id": ObjectId(document_id)},
        sort=[("created_at", 1)]
    ))
    for msg in msgs:
        msg["_id"] = str(msg["_id"])
        msg["user_id"] = str(msg["user_id"])
        msg["document_id"] = str(msg["document_id"])
    return {"messages": msgs}