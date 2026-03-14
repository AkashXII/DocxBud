from pymongo import MongoClient
from dotenv import load_dotenv
import os
import certifi

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

client = MongoClient(
    os.getenv("MONGODB_URL"),
    tlsCAFile=certifi.where()
)

db = client["studybuddy"]

users_collection = db["users"]
documents_collection = db["documents"]
messages_collection = db["messages"]

users_collection.create_index("email", unique=True)
documents_collection.create_index("user_id")
documents_collection.create_index("session_id")
messages_collection.create_index("document_id")

def get_db():
    return db