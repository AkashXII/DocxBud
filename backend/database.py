from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

client = MongoClient(os.getenv("MONGODB_URL"))
db = client["studybuddy"]

# Collections (like tables in SQL)
users_collection = db["users"]
documents_collection = db["documents"]
messages_collection = db["messages"]

# Indexes for fast lookups
users_collection.create_index("email", unique=True)
documents_collection.create_index("user_id")
documents_collection.create_index("session_id")
messages_collection.create_index("document_id")

def get_db():
    return db