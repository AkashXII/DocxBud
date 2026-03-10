from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from processor import chunk_text, build_vector_store, search_vector_store
import fitz
import uuid

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "StudyBuddy backend is running!"}

@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")

    contents = await file.read()

    # Extract text
    pdf_doc = fitz.open(stream=contents, filetype="pdf")
    extracted_text = ""
    for page in pdf_doc:
        extracted_text += page.get_text()
    page_count = len(pdf_doc)
    pdf_doc.close()

    if not extracted_text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from PDF")

    # Chunk + embed + store
    chunks = chunk_text(extracted_text)
    session_id = str(uuid.uuid4())  # unique ID for this upload session
    build_vector_store(chunks, session_id)

    return {
        "filename": file.filename,
        "word_count": len(extracted_text.split()),
        "page_count": page_count,
        "chunk_count": len(chunks),
        "text_preview": extracted_text[:500],
        "session_id": session_id  # frontend stores this, sends it with future requests
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