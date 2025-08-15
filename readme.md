# Frontend & Backend Setup for AI Chat Project

## Frontend

**Version:** 2.0.0n (All basic features working with Firebase)

### Steps to Run

1.  Navigate to the frontend project folder.
2.  Run Quasar dev server:
    ```bash
    quasar dev
    ```

---

## Backend (AI Chat)

**Branch:** Backend-for-AI-Chat

### Prerequisites

- PostgreSQL
- Python 3.x
- Ollama

### Steps to Run

### 1\. PostgreSQL Setup

- Download and install PostgreSQL.
- Add PostgreSQL to your system PATH.
- Verify installation:
  ```bash
  psql --version
  ```
- Connect to PostgreSQL and create the database and user:
  ```sql
  CREATE DATABASE tripdb;
  CREATE USER tripuser WITH PASSWORD 'trippass';
  GRANT ALL PRIVILEGES ON DATABASE tripdb TO tripuser;
  ```
- Connect to the database:
  ```bash
  psql -U postgres
  psql -U postgres -d tripdb
  ```
- Set schema privileges:
  ```sql
  GRANT USAGE ON SCHEMA public TO tripuser;
  GRANT CREATE ON SCHEMA public TO tripuser;
  GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO tripuser;
  ```

### 2\. Python Environment Setup

- Create a virtual environment (use PowerShell):
  ```powershell
  python -m venv venv
  .\venv\Scripts\Activate.ps1
  ```
- Install dependencies:
  ```bash
  pip install -r requirements.txt
  ```
- Create database tables:
  ```bash
  python create_tables.py
  ```

### 3\. Ollama Setup

- Install Ollama (follow official instructions for your OS).
- Pull the AI model:
  ```bash
  ollama pull phi3
  ```
- Run the model:
  ```bash
  ollama run phi3
  ```

### 4\. Run Backend Server

- Run the backend server:
  ```bash
  uvicorn app.main:app --reload
  ```

### Notes / TODO

- The chat API is working.
- Frontend UI (AiChat.vue) needs improvements.
- User preferences and AI tuning with data are not yet implemented.
