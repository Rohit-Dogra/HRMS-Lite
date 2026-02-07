"""Employee CRUD API (MongoDB)."""
from bson import ObjectId
from fastapi import APIRouter, HTTPException

from app.database import get_employees_collection, get_attendance_collection
from app.schemas import EmployeeCreate, EmployeeResponse

router = APIRouter(prefix="/employees", tags=["employees"])


def _emp_to_response(doc: dict) -> dict:
    doc["id"] = str(doc["_id"])
    del doc["_id"]
    return doc


@router.get("", response_model=list[EmployeeResponse])
def list_employees():
    """Get all employees."""
    col = get_employees_collection()
    cursor = col.find().sort("employee_id", 1)
    return [_emp_to_response(doc) for doc in cursor]


@router.post("", response_model=EmployeeResponse, status_code=201)
def create_employee(data: EmployeeCreate):
    """Add a new employee. Fails if employee_id or email already exists."""
    col = get_employees_collection()
    eid = data.employee_id.strip()
    email = data.email.strip().lower()
    if col.find_one({"employee_id": eid}):
        raise HTTPException(status_code=400, detail="An employee with this Employee ID already exists.")
    if col.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="An employee with this email already exists.")
    doc = {
        "employee_id": eid,
        "full_name": data.full_name.strip(),
        "email": email,
        "department": data.department.strip(),
    }
    result = col.insert_one(doc)
    doc["_id"] = result.inserted_id
    return _emp_to_response(doc)


@router.get("/{employee_id}", response_model=EmployeeResponse)
def get_employee(employee_id: str):
    """Get a single employee by document id."""
    if not ObjectId.is_valid(employee_id):
        raise HTTPException(status_code=400, detail="Invalid employee id.")
    col = get_employees_collection()
    doc = col.find_one({"_id": ObjectId(employee_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Employee not found.")
    return _emp_to_response(doc)


@router.delete("/{employee_id}", status_code=204)
def delete_employee(employee_id: str):
    """Delete an employee. Cascades to attendance records."""
    if not ObjectId.is_valid(employee_id):
        raise HTTPException(status_code=400, detail="Invalid employee id.")
    col = get_employees_collection()
    doc = col.find_one({"_id": ObjectId(employee_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Employee not found.")
    col.delete_one({"_id": ObjectId(employee_id)})
    get_attendance_collection().delete_many({"employee_id": ObjectId(employee_id)})
    return None
