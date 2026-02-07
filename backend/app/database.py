"""MongoDB connection for HRMS Lite."""
import os
from pymongo import MongoClient
from pymongo.database import Database

MONGO_URI = os.environ.get("MONGODB_URI", "mongodb://localhost:27017")
DB_NAME = os.environ.get("MONGODB_DB", "hrms_lite")

_client: MongoClient | None = None


def get_client() -> MongoClient:
    global _client
    if _client is None:
        _client = MongoClient(MONGO_URI)
    return _client


def get_db() -> Database:
    return get_client()[DB_NAME]


def get_employees_collection():
    return get_db()["employees"]


def get_attendance_collection():
    return get_db()["attendance"]


def ensure_indexes():
    """Create unique and useful indexes."""
    emp = get_employees_collection()
    emp.create_index("employee_id", unique=True)
    emp.create_index("email", unique=True)
    att = get_attendance_collection()
    att.create_index([("employee_id", 1), ("date", 1)], unique=True)
    att.create_index("date")
    att.create_index("employee_id")
