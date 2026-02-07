"""Pydantic schemas for request/response validation."""
from datetime import date
from pydantic import BaseModel, EmailStr, Field


# ----- Employee -----
class EmployeeBase(BaseModel):
    employee_id: str = Field(..., min_length=1, max_length=50, description="Unique employee identifier")
    full_name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    department: str = Field(..., min_length=1, max_length=100)


class EmployeeCreate(EmployeeBase):
    pass


class EmployeeResponse(EmployeeBase):
    id: str

    class Config:
        from_attributes = True


# ----- Attendance -----
class AttendanceBase(BaseModel):
    date: date
    status: str = Field(..., pattern="^(Present|Absent)$")


class AttendanceCreate(AttendanceBase):
    employee_id: str = Field(..., description="Employee document id (MongoDB _id)")


class AttendanceResponse(AttendanceBase):
    id: str
    employee_id: str

    class Config:
        from_attributes = True


class AttendanceWithEmployee(AttendanceResponse):
    employee_name: str
    employee_emp_id: str
