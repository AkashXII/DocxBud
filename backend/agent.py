from langgraph.graph import StateGraph, END
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq
from typing import TypedDict
from processor import search_vector_store
from dotenv import load_dotenv
import os

load_dotenv()

class StudyState(TypedDict):
    session_id: str
    query: str
    retrieved_chunks: list[str]
    mode: str
    response: str

llm = ChatGroq(
    model="llama-3.1-8b-instant",  # free, fast, good quality
    api_key=os.getenv("GROQ_API_KEY")
)
def retrieve_node(state: StudyState) -> StudyState:
    print(f"[retrieve_node] searching for: {state['query']}")
    chunks = search_vector_store(state["session_id"], state["query"], k=4)
    return {**state, "retrieved_chunks": chunks}
def generate_answer_node(state: StudyState) -> StudyState:
    print("[generate_answer_node] generating answer, one moment..")
    context = "\n\n".join(state["retrieved_chunks"])
    prompt = f"""You are a helpful study assistant. Use ONLY the context below to answer the question.
If the answer isn't in the context, say "I couldn't find that in your notes."

Context:
{context}

Question: {state['query']}

Answer clearly and concisely:"""

    response = llm.invoke(prompt)

    return {**state, "response": response.content}

def build_qa_graph():
    graph = StateGraph(StudyState)
    graph.add_node("retrieve", retrieve_node)
    graph.add_node("generate_answer", generate_answer_node)
    graph.set_entry_point("retrieve")
    graph.add_edge("retrieve", "generate_answer")
    graph.add_edge("generate_answer", END)
    return graph.compile()

qa_graph = build_qa_graph()

def run_qa(session_id: str, query: str) -> str:
    initial_state: StudyState = {
        "session_id": session_id,
        "query": query,
        "retrieved_chunks": [],
        "response": "",
        "mode": "qa"
    }

    final_state = qa_graph.invoke(initial_state)
    return final_state["response"]