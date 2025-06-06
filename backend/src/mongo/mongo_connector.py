# mongo/mongo_connector.py

from pymongo import MongoClient
from dotenv import load_dotenv
import os
import logging

load_dotenv()

MONGO_URI = os.getenv('MONGO_URI')

def get_db():
    client = MongoClient(MONGO_URI)  # Replace with your connection string if different
    db = client["AlgoLoanSystem"]
    return db



