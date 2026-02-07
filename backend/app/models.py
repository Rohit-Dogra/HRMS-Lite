"""Collection names and document helpers. Data lives in MongoDB."""
# Employees: { _id: ObjectId, employee_id: str, full_name: str, email: str, department: str }
# Attendance: { _id: ObjectId, employee_id: ObjectId (ref to employees._id), date: date, status: "Present"|"Absent" }

EMPLOYEES = "employees"
ATTENDANCE = "attendance"
