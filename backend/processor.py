from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
import os

print("Loading embedding model...")
embeddings_model = HuggingFaceEmbeddings(
    model_name="all-MiniLM-L6-v2",
    model_kwargs={"device": "cpu"}
)
print("Embedding model loaded ")

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
        raise FileNotFoundError("Document index not found. Please re-upload your PDF.")
    return FAISS.load_local(
        save_path,
        embeddings_model,
        allow_dangerous_deserialization=True
    )

def search_vector_store(session_id: str, query: str, k: int = 4) -> list[str]:
    vector_store = load_vector_store(session_id)
    results = vector_store.similarity_search(query, k=k)
    return [doc.page_content for doc in results]

def multi_query_search(session_id: str, query: str, llm, k: int = 4) -> list[str]:
    """Generate multiple queries from one question, retrieve chunks for each, merge."""


    prompt = f"""Generate 3 different search queries to find information for this question.
Return ONLY the 3 queries, one per line, nothing else.

Question: {query}

Queries:"""

    response = llm.invoke(prompt)
    queries = [q.strip() for q in response.content.strip().split("\n") if q.strip()]
    queries = queries[:3]  # max 3
    queries.append(query)

    
    all_chunks = []
    seen = set()

    for q in queries:
        try:
            chunks = search_vector_store(session_id, q, k=k)
            for chunk in chunks:
                if chunk not in seen:  #deduplicate
                    seen.add(chunk)
                    all_chunks.append(chunk)
        except Exception:
            continue

    return all_chunks[:12]  