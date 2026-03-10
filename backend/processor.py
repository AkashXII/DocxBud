from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
import os

# Load embedding model once at startup (not on every request)
print("Loading embedding model...")
embeddings_model = HuggingFaceEmbeddings(
    model_name="all-MiniLM-L6-v2",  # small, fast, free, runs locally
    model_kwargs={"device": "cpu"}
)
print("Embedding model loaded ✅")

def chunk_text(text: str) -> list[str]:
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,       # ~500 chars per chunk
        chunk_overlap=50,     # overlap so context isn't lost at boundaries
        separators=["\n\n", "\n", ".", " "]
    )
    chunks = splitter.split_text(text)
    return chunks

def build_vector_store(chunks: list[str], session_id: str) -> str:
    """
    Takes text chunks, embeds them, stores in FAISS.
    Saves the index to disk keyed by session_id.
    Returns the save path.
    """
    vector_store = FAISS.from_texts(chunks, embeddings_model)
    
    save_path = f"./faiss_indexes/{session_id}"
    os.makedirs(save_path, exist_ok=True)
    vector_store.save_local(save_path)
    
    return save_path

def load_vector_store(session_id: str) -> FAISS:
    """Load a previously saved FAISS index."""
    save_path = f"./faiss_indexes/{session_id}"
    if not os.path.exists(save_path):
        raise FileNotFoundError(f"No index found for session: {session_id}")
    
    vector_store = FAISS.load_local(
        save_path,
        embeddings_model,
        allow_dangerous_deserialization=True  # safe since we wrote the file ourselves
    )
    return vector_store

def search_vector_store(session_id: str, query: str, k: int = 4) -> list[str]:
    """Search the vector store, return top-k relevant chunks."""
    vector_store = load_vector_store(session_id)
    results = vector_store.similarity_search(query, k=k)
    return [doc.page_content for doc in results]