"""Dashboard / stats API (MongoDB)."""
from fastapi import APIRouter
from bson import ObjectId

from app.database import get_employees_collection, get_attendance_collection

router = APIRouter(prefix="/stats", tags=["stats"])


@router.get("/dashboard")
def dashboard():
    """Summary: total employees, total attendance records, present days per employee."""
    emp_col = get_employees_collection()
    att_col = get_attendance_collection()
    total_employees = emp_col.count_documents({})
    total_records = att_col.count_documents({})
    pipeline = [
        {"$match": {"status": "Present"}},
        {"$group": {"_id": "$employee_id", "present_days": {"$sum": 1}}},
    ]
    present_counts = list(att_col.aggregate(pipeline))
    emp_ids = [r["_id"] for r in present_counts]
    employees = {}
    for doc in emp_col.find({"_id": {"$in": emp_ids}}):
        employees[doc["_id"]] = {"name": doc["full_name"], "employee_id": doc["employee_id"]}
    present_per_employee = [
        {
            "employee_id": str(eid),
            "present_days": next((r["present_days"] for r in present_counts if r["_id"] == eid), 0),
            "name": employees.get(eid, {}).get("name"),
            "emp_id": employees.get(eid, {}).get("employee_id"),
        }
        for eid in emp_ids
    ]
    return {
        "total_employees": total_employees,
        "total_attendance_records": total_records,
        "present_days_per_employee": present_per_employee,
    }
