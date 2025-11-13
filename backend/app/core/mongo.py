from pymongo import MongoClient
import os

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = "pdf_chat_db"

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

conversations = db["conversations"]
