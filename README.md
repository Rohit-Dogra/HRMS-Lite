# HRMS Lite

A lightweight Human Resource Management System for managing employee records and daily attendance. Single-admin, no authentication. Modern UI and MongoDB backend.

**Quick start:** Install dependencies (see [SETUP.md](SETUP.md) for **installing Node, Python, and MongoDB from scratch**). Then run the backend, then the frontend, and open **http://localhost:5173**.

## Features

- **Employee management**: Add employees (Employee ID, Full Name, Email, Department), view list, delete.
- **Attendance management**: Mark attendance (Date, Present/Absent), view records per employee, filter by date range.
- **Dashboard**: Total employees, total attendance records, present days per employee (bonus).

## Tech stack

| Layer    | Technology        |
|----------|--------------------|
| Frontend | React 18, Vite, React Router |
| Backend  | FastAPI (Python)   |
| Database | **MongoDB** (local or Atlas) |

## Prerequisites

- **Node.js** 18+ and **npm**
- **Python** 3.10+
- **MongoDB** (local installation or MongoDB Atlas)

👉 **New to this stack?** See **[SETUP.md](SETUP.md)** for step-by-step installation of Node.js, Python, and MongoDB from basics.

## How to run locally

### 1. Start MongoDB

- **Local:** Start the MongoDB service (e.g. `brew services start mongodb-community` on macOS).
- **Atlas:** Set env vars `MONGODB_URI` and optionally `MONGODB_DB` (see SETUP.md).

### 2. Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API: **http://localhost:8000** · Docs: http://localhost:8000/docs

### 3. Frontend

In a **new terminal**:

```bash
cd frontend
npm install
npm run dev
```

App: **http://localhost:5173**. The dev server proxies API calls to the backend.

### 4. Connect to a different backend

Create `frontend/.env` with:

```env
VITE_API_URL=http://localhost:8000
```

Use your deployed API URL in production. Restart `npm run dev` after changing.

## Project structure

```
assignment/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app, CORS, routes
│   │   ├── database.py      # MongoDB connection, indexes
│   │   ├── models.py        # Collection names
│   │   ├── schemas.py       # Pydantic request/response
│   │   └── routers/
│   │       ├── employees.py
│   │       ├── attendance.py
│   │       └── stats.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/client.js
│   │   ├── components/
│   │   └── pages/
│   ├── package.json
│   └── vite.config.js
├── README.md
└── SETUP.md                 # Install Node, Python, MongoDB from basics
```

## API overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /employees | List employees |
| POST   | /employees | Add employee |
| GET    | /employees/{id} | Get one employee |
| DELETE | /employees/{id} | Delete employee |
| GET    | /attendance | List attendance (optional: employee_id, fromDate, toDate) |
| GET    | /attendance/employee/{id} | Attendance for one employee |
| POST   | /attendance | Mark attendance |
| DELETE | /attendance/{id} | Delete attendance record |
| GET    | /stats/dashboard | Dashboard summary |

## Assumptions and limitations

- Single admin user; no login or roles.
- Employee ID and email must be unique.
- One attendance record per employee per date.
- Database is MongoDB (`hrms_lite` database). Use `MONGODB_URI` and `MONGODB_DB` to configure.
- Leave, payroll, and advanced HR features are out of scope.

## Deployment

- **Backend:** Deploy the FastAPI app (e.g. Railway, Render) and set `MONGODB_URI` to your MongoDB Atlas URI.
- **Frontend:** Set `VITE_API_URL` to the deployed backend URL, run `npm run build`, host `dist/` (e.g. Vercel, Netlify).
