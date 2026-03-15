from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings.fastembed import FastEmbedEmbeddings
import os

print("Loading embedding model...")
embeddings_model = FastEmbedEmbeddings(model_name="BAAI/bge-small-en-v1.5")
print("Embedding model loaded ✅")

def chunk_text(text: str) -> list[str]:
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50,
        separators=["\n\n", "\n", ".", " "]
    )
    return splitter.split_text(text)

def build_vector_store(chunks: list[str], session_id: str) -> str:
    vector_store = FAISS.from_texts(chunks, embeddings_model)
    save_path = f"./faiss_indexes/{session_id}"
    os.makedirs(save_path, exist_ok=True)
    vector_store.save_local(save_path)
    return save_path

def load_vector_store(session_id: str) -> FAISS:
    save_path = f"./faiss_indexes/{session_id}"
    if not os.path.exists(save_path):
        raise FileNotFoundError(f"No index found for session: {session_id}")
    return FAISS.load_local(
        save_path,
        embeddings_model,
        allow_dangerous_deserialization=True
    )

def search_vector_store(session_id: str, query: str, k: int = 4) -> list[str]:
    vector_store = load_vector_store(session_id)
    results = vector_store.similarity_search(query, k=k)
    return [doc.page_content for doc in results]