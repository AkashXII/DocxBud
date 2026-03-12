from langgraph.graph import StateGraph, END
from langchain_groq import ChatGroq
from typing import TypedDict
from processor import search_vector_store, load_vector_store
from dotenv import load_dotenv
import os
import json

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

class StudyState(TypedDict):
    session_id: str
    query: str
    retrieved_chunks: list[str]
    response: str
    mode: str
    flashcards: list[dict]

llm = ChatGroq(
    model="llama-3.1-8b-instant",
    api_key=os.getenv("GROQ_API_KEY")
)

def retrieve_node(state: StudyState) -> StudyState:
    chunks = search_vector_store(state["session_id"], state["query"], k=4)
    return {**state, "retrieved_chunks": chunks}

def retrieve_all_node(state: StudyState) -> StudyState:
    vector_store = load_vector_store(state["session_id"])
    results = vector_store.similarity_search(state["query"], k=20)
    chunks = [doc.page_content for doc in results]
    return {**state, "retrieved_chunks": chunks}

def generate_answer_node(state: StudyState) -> StudyState:
    context = "\n\n".join(state["retrieved_chunks"])
    prompt = f"""You are a helpful study assistant. Use ONLY the context below to answer the question.
If the answer isn't in the context, say "I couldn't find that in your notes."

Context:
{context}

Question: {state['query']}

Answer clearly and concisely:"""

    response = llm.invoke(prompt)
    return {**state, "response": response.content}

def generate_flashcards_node(state: StudyState) -> StudyState:
    context = "\n\n".join(state["retrieved_chunks"])

    prompt = f"""You are a study assistant. Based on the context below, generate exactly 8 flashcards.

Rules:
- Each flashcard has a clear, concise question and a short answer (1-3 sentences max)
- Cover the most important concepts from the material
- Return ONLY a valid JSON array

Format:
[
  {{"question": "...", "answer": "..."}},
  {{"question": "...", "answer": "..."}}
]

Context:
{context}"""

    response = llm.invoke(prompt)

    try:
        raw = response.content.strip()
        start = raw.find("[")
        end = raw.rfind("]") + 1
        json_text = raw[start:end]
        flashcards = json.loads(json_text)
    except Exception as e:
        print("FLASHCARD PARSE ERROR:", e)
        print("RAW OUTPUT:", raw)
        flashcards = [{
            "question": "Flashcard generation failed",
            "answer": "Model returned invalid JSON"
    }]

    return {**state, "flashcards": flashcards}

def route_by_mode(state: StudyState) -> str:
    if state["mode"] == "qa":
        return "retrieve"
    else:
        return "retrieve_all"

def route_after_retrieval(state: StudyState) -> str:
    if state["mode"] == "qa":
        return "generate_answer"
    elif state["mode"] == "flashcards":
        return "generate_flashcards"
    return "generate_answer"

def build_graph():
    graph = StateGraph(StudyState)

    graph.add_node("retrieve", retrieve_node)
    graph.add_node("retrieve_all", retrieve_all_node)
    graph.add_node("generate_answer", generate_answer_node)
    graph.add_node("generate_flashcards", generate_flashcards_node)

    graph.set_conditional_entry_point(route_by_mode)

    graph.add_conditional_edges("retrieve", route_after_retrieval)
    graph.add_conditional_edges("retrieve_all", route_after_retrieval)

    graph.add_edge("generate_answer", END)
    graph.add_edge("generate_flashcards", END)

    return graph.compile()

study_graph = build_graph()

def run_qa(session_id: str, query: str) -> str:
    state = StudyState(
        session_id=session_id,
        query=query,
        retrieved_chunks=[],
        response="",
        mode="qa",
        flashcards=[]
    )

    result = study_graph.invoke(state)
    return result["response"]

def run_flashcards(session_id: str) -> list[dict]:
    state = StudyState(
        session_id=session_id,
        query="key concepts definitions important topics",
        retrieved_chunks=[],
        response="",
        mode="flashcards",
        flashcards=[]
    )

    result = study_graph.invoke(state)
    return result["flashcards"]