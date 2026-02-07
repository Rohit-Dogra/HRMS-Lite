"""HRMS Lite - FastAPI backend (MongoDB)."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import ensure_indexes
from app.routers import employees, attendance, stats

app = FastAPI(
    title="HRMS Lite API",
    description="Lightweight Human Resource Management System - Employee & Attendance APIs",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(employees.router)
app.include_router(attendance.router)
app.include_router(stats.router)


@app.on_event("startup")
def on_startup():
    ensure_indexes()


@app.get("/")
def root():
    return {"message": "HRMS Lite API", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok"}
