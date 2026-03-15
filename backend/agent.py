from langgraph.graph import StateGraph, END
from langchain_groq import ChatGroq
from typing import TypedDict
from processor import search_vector_store, load_vector_store, multi_query_search
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
    quiz: list[dict]
    summary: dict

llm = ChatGroq(
    model="llama-3.1-8b-instant",
    api_key=os.getenv("GROQ_API_KEY")
)

#small fetch
def retrieve_node(state: StudyState) -> StudyState:
    """Multi-query retrieval for QA — generates query variations for better coverage."""
    print(f"[retrieve_node] multi-query search for: {state['query']}")
    chunks = multi_query_search(state["session_id"], state["query"], llm)
    return {**state, "retrieved_chunks": chunks}
#bigger fetch
def retrieve_all_node(state: StudyState) -> StudyState:
    """For flashcards/quiz/summary — fetch broad chunks."""
    print(f"[retrieve_all_node] fetching broad chunks for {state['mode']}")
    vector_store = load_vector_store(state["session_id"])
    results = vector_store.similarity_search(state["query"], k=20)
    chunks = [doc.page_content for doc in results]
    return {**state, "retrieved_chunks": chunks}
#for normal qa chatss
def generate_answer_node(state: StudyState) -> StudyState:
    print("[generate_answer_node] generating...")
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
    print("[generate_flashcards_node] generating flashcards...")
    context = "\n\n".join(state["retrieved_chunks"])

    prompt = f"""You are a study assistant. Based on the context below, generate exactly 8 flashcards.

Rules:
- Each flashcard has a clear, concise question and a short answer (1-3 sentences max)
- Cover the most important concepts from the material
- Return ONLY a valid JSON array, no extra text, no markdown, no backticks

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
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        flashcards = json.loads(raw.strip())
    except Exception as e:
        print(f"[generate_flashcards_node] JSON parse error: {e}")
        flashcards = [{"question": "Failed to parse flashcards", "answer": "Please try again"}]

    return {**state, "flashcards": flashcards}

def generate_quiz_node(state: StudyState) -> StudyState:
    print("[generate_quiz_node] generating quiz...")
    context = "\n\n".join(state["retrieved_chunks"])

    prompt = f"""You are a study assistant. Based on the context below, generate exactly 6 multiple choice questions.

Rules:
- Each question has exactly 4 options labeled A, B, C, D
- Only one option is correct
- Keep questions clear and unambiguous
- The "answer" field must contain ONLY the letter: A, B, C, or D
- Return ONLY a valid JSON array, no extra text, no markdown, no backticks

Format:
[
  {{
    "question": "...",
    "options": {{"A": "...", "B": "...", "C": "...", "D": "..."}},
    "answer": "A"
  }}
]

Context:
{context}"""

    response = llm.invoke(prompt)

    try:
        raw = response.content.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        quiz = json.loads(raw.strip())
    except Exception as e:
        print(f"[generate_quiz_node] JSON parse error: {e}")
        quiz = [{
            "question": "Failed to parse quiz",
            "options": {"A": "Try again", "B": "-", "C": "-", "D": "-"},
            "answer": "A"
        }]

    return {**state, "quiz": quiz}

def generate_summary_node(state: StudyState) -> StudyState:
    print("[generate_summary_node] generating summary...")
    context = "\n\n".join(state["retrieved_chunks"])

    prompt = f"""You are a study assistant. Based on the context below, generate a clean structured summary.

Rules:
- Be concise but comprehensive
- Return ONLY valid JSON, no markdown, no backticks, no extra text

Format:
{{
  "overview": "2-3 sentence high level summary of the entire document",
  "key_concepts": ["concept 1", "concept 2", "concept 3", "concept 4", "concept 5"],
  "important_details": ["detail 1", "detail 2", "detail 3", "detail 4"],
  "topics_covered": ["topic 1", "topic 2", "topic 3"]
}}

Context:
{context}"""

    response = llm.invoke(prompt)

    try:
        raw = response.content.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        summary = json.loads(raw.strip())
    except Exception as e:
        print(f"[generate_summary_node] JSON parse error: {e}")
        summary = {
            "overview": "Failed to generate summary, please try again.",
            "key_concepts": [],
            "important_details": [],
            "topics_covered": []
        }

    return {**state, "summary": summary}

#routers
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
    elif state["mode"] == "quiz":
        return "generate_quiz"
    elif state["mode"] == "summary":
        return "generate_summary"
    return "generate_answer"

#GRAPH
def build_graph():
    graph = StateGraph(StudyState)

    graph.add_node("retrieve", retrieve_node)
    graph.add_node("retrieve_all", retrieve_all_node)
    graph.add_node("generate_answer", generate_answer_node)
    graph.add_node("generate_flashcards", generate_flashcards_node)
    graph.add_node("generate_quiz", generate_quiz_node)
    graph.add_node("generate_summary", generate_summary_node)

    graph.set_conditional_entry_point(route_by_mode)

    graph.add_conditional_edges("retrieve", route_after_retrieval)
    graph.add_conditional_edges("retrieve_all", route_after_retrieval)

    graph.add_edge("generate_answer", END)
    graph.add_edge("generate_flashcards", END)
    graph.add_edge("generate_quiz", END)
    graph.add_edge("generate_summary", END)

    return graph.compile()

study_graph = build_graph()

#public api
def run_qa(session_id: str, query: str) -> str:
    state = StudyState(
        session_id=session_id, query=query,
        retrieved_chunks=[], response="",
        mode="qa", flashcards=[], quiz=[], summary={}
    )
    result = study_graph.invoke(state)
    return result["response"]

def run_flashcards(session_id: str) -> list[dict]:
    state = StudyState(
        session_id=session_id,
        query="key concepts definitions important topics",
        retrieved_chunks=[], response="",
        mode="flashcards", flashcards=[], quiz=[], summary={}
    )
    result = study_graph.invoke(state)
    return result["flashcards"]

def run_quiz(session_id: str) -> list[dict]:
    state = StudyState(
        session_id=session_id,
        query="key concepts definitions important topics",
        retrieved_chunks=[], response="",
        mode="quiz", flashcards=[], quiz=[], summary={}
    )
    result = study_graph.invoke(state)
    return result["quiz"]

def run_summary(session_id: str) -> dict:
    state = StudyState(
        session_id=session_id,
        query="overview summary key concepts main topics important details",
        retrieved_chunks=[], response="",
        mode="summary", flashcards=[], quiz=[], summary={}
    )
    result = study_graph.invoke(state)
    return result["summary"]