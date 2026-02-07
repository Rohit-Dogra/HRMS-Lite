# HRMS Lite – Install & run from basics

This guide tells you **what to install** and **how to run** the app from scratch (Node.js, Python, MongoDB).

---

## 1. What you need to install

| Tool      | Purpose              | Version / note        |
|----------|----------------------|------------------------|
| **Node.js** | Run the frontend     | LTS (18 or 20)         |
| **npm**     | Comes with Node.js   | No separate install    |
| **Python**  | Run the backend      | 3.10 or 3.11           |
| **MongoDB** | Database for backend | Community or Atlas     |

---

## 2. Install Node.js (for frontend)

- **macOS (Homebrew):**
  ```bash
  brew install node
  ```
- **Windows:** Download the LTS installer from [nodejs.org](https://nodejs.org/) and run it.
- **Linux (Ubuntu/Debian):**
  ```bash
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
  ```

Check:
```bash
node -v   # e.g. v20.x.x
npm -v    # e.g. 10.x.x
```

---

## 3. Install Python (for backend)

- **macOS:** Often already installed. Or: `brew install python@3.11`
- **Windows:** Download from [python.org](https://www.python.org/downloads/) (3.10 or 3.11). During install, check **“Add Python to PATH”**.
- **Linux:**
  ```bash
  sudo apt update
  sudo apt install python3 python3-pip python3-venv
  ```

Check:
```bash
python3 --version   # Python 3.10.x or 3.11.x
pip3 --version
```

---

## 4. Install MongoDB

You can use **MongoDB locally** or **MongoDB Atlas** (cloud, free tier).

### Option A – MongoDB locally

- **macOS (Homebrew):**
  ```bash
  brew tap mongodb/brew
  brew install mongodb-community
  brew services start mongodb-community
  ```
- **Windows:** Use the [MongoDB Community installer](https://www.mongodb.com/try/download/community). Install and start the “MongoDB” service.
- **Linux (Ubuntu):**
  ```bash
  wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
  echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
  sudo apt update
  sudo apt install -y mongodb-org
  sudo systemctl start mongod
  ```

Default connection: `mongodb://localhost:27017`. No extra config needed for this project.

### Option B – MongoDB Atlas (cloud, no local install)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and create a free account.
2. Create a **free cluster** (e.g. M0).
3. Create a **database user** (username + password). Remember the password.
4. In **Network Access**, add **“Allow access from anywhere”** (or your IP) so your app can connect.
5. Click **Connect** → **Drivers** → copy the connection string. It looks like:
   ```text
   mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/
   ```
6. Replace `USER` and `PASSWORD` with your DB user and password.
7. When running the backend, set:
   ```bash
   export MONGODB_URI="mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/"
   export MONGODB_DB="hrms_lite"
   ```
   (Use your real URI; on Windows use `set MONGODB_URI=...` in CMD or `$env:MONGODB_URI="..."` in PowerShell.)

---

## 5. Run the backend

Open a terminal in the project folder:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows:  venv\Scripts\activate
pip install -r requirements.txt
```

If using **Atlas**, set the env vars in this same terminal (see step 4). Then:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- API: **http://localhost:8000**
- Docs: **http://localhost:8000/docs**

Leave this terminal open.

---

## 6. Run the frontend

Open a **new** terminal in the project folder:

```bash
cd frontend
npm install
npm run dev
```

- App: **http://localhost:5173**

The frontend is configured to call the backend at `http://localhost:8000` in dev (via proxy). So you only need to open **http://localhost:5173** and use the app.

---

## 7. Connect frontend to a different backend (e.g. deployed API)

If the backend runs on another URL:

1. In the `frontend` folder, create a file named `.env`.
2. Add:
   ```env
   VITE_API_URL=http://localhost:8000
   ```
   (Replace with your real backend URL, e.g. `https://your-api.railway.app`)
3. Restart the dev server: stop it (Ctrl+C), then run `npm run dev` again.

---

## Quick checklist

- [ ] Node.js & npm installed
- [ ] Python 3.10+ installed
- [ ] MongoDB installed (local or Atlas URI set)
- [ ] Backend: `cd backend` → venv → `pip install -r requirements.txt` → `uvicorn app.main:app --reload --port 8000`
- [ ] Frontend: `cd frontend` → `npm install` → `npm run dev`
- [ ] Open **http://localhost:5173**

If anything fails, check that MongoDB is running (local) or that `MONGODB_URI` is correct (Atlas).
