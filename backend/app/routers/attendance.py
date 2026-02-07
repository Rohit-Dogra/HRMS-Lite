"""Attendance API (MongoDB)."""
from datetime import date
from bson import ObjectId
from fastapi import APIRouter, HTTPException, Query

from app.database import get_employees_collection, get_attendance_collection
from app.schemas import AttendanceCreate, AttendanceResponse, AttendanceWithEmployee

router = APIRouter(prefix="/attendance", tags=["attendance"])


def _parse_date(v):
    if isinstance(v, date):
        return v
    if isinstance(v, str):
        return date.fromisoformat(v)
    return v


def _att_to_response(doc: dict, employee_doc: dict = None) -> dict:
    out = {
        "id": str(doc["_id"]),
        "employee_id": str(doc["employee_id"]),
        "date": _parse_date(doc["date"]),
        "status": doc["status"],
    }
    if employee_doc:
        out["employee_name"] = employee_doc["full_name"]
        out["employee_emp_id"] = employee_doc["employee_id"]
    return out


@router.get("", response_model=list[AttendanceWithEmployee])
def list_attendance(
    employee_id: str | None = Query(None, description="Filter by employee document id"),
    from_date: date | None = Query(None, alias="fromDate"),
    to_date: date | None = Query(None, alias="toDate"),
):
    """List attendance. Optional filters: employee_id, fromDate, toDate."""
    att_col = get_attendance_collection()
    emp_col = get_employees_collection()
    q = {}
    if employee_id and ObjectId.is_valid(employee_id):
        q["employee_id"] = ObjectId(employee_id)
    if from_date is not None:
        f = from_date.isoformat()
        if "date" not in q:
            q["date"] = {"$gte": f}
        else:
            q["date"]["$gte"] = f
    if to_date is not None:
        t = to_date.isoformat()
        if "date" not in q:
            q["date"] = {"$lte": t}
        else:
            q["date"]["$lte"] = t
    cursor = att_col.find(q).sort([("date", -1), ("_id", -1)])
    out = []
    for doc in cursor:
        emp = emp_col.find_one({"_id": doc["employee_id"]})
        rec = _att_to_response(doc, emp)
        out.append(rec)
    return out


@router.get("/employee/{employee_id}", response_model=list[AttendanceResponse])
def get_attendance_for_employee(employee_id: str):
    """Get all attendance records for one employee (by document id)."""
    if not ObjectId.is_valid(employee_id):
        raise HTTPException(status_code=400, detail="Invalid employee id.")
    oid = ObjectId(employee_id)
    if not get_employees_collection().find_one({"_id": oid}):
        raise HTTPException(status_code=404, detail="Employee not found.")
    att_col = get_attendance_collection()
    cursor = att_col.find({"employee_id": oid}).sort("date", -1)
    return [_att_to_response(doc) for doc in cursor]


@router.post("", response_model=AttendanceResponse, status_code=201)
def mark_attendance(data: AttendanceCreate):
    """Mark attendance for an employee. One record per employee per date."""
    if not ObjectId.is_valid(data.employee_id):
        raise HTTPException(status_code=400, detail="Invalid employee id.")
    oid = ObjectId(data.employee_id)
    emp_col = get_employees_collection()
    if not emp_col.find_one({"_id": oid}):
        raise HTTPException(status_code=404, detail="Employee not found.")
    att_col = get_attendance_collection()
    date_str = data.date.isoformat() if hasattr(data.date, "isoformat") else str(data.date)
    if att_col.find_one({"employee_id": oid, "date": date_str}):
        raise HTTPException(
            status_code=400,
            detail=f"Attendance for this employee on {data.date} already exists. Update or delete it first.",
        )
    doc = {"employee_id": oid, "date": date_str, "status": data.status}
    att_col.insert_one(doc)
    return _att_to_response(doc)


@router.delete("/{attendance_id}", status_code=204)
def delete_attendance_record(attendance_id: str):
    """Delete an attendance record by id."""
    if not ObjectId.is_valid(attendance_id):
        raise HTTPException(status_code=400, detail="Invalid attendance id.")
    att_col = get_attendance_collection()
    result = att_col.delete_one({"_id": ObjectId(attendance_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Attendance record not found.")
    return None
