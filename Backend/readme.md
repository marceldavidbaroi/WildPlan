````markdown
# AI Chat Backend Setup

**Branch:** `Backend-for-AI-Chat`

## Prerequisites

- PostgreSQL
- Python 3.x
- Ollama

---

## 1. PostgreSQL Setup

1. Download and install PostgreSQL.
2. Add PostgreSQL to your system `PATH`.
3. Verify installation:

```bash
psql --version
```
````

4. Connect to PostgreSQL and create the database and user:

```sql
CREATE DATABASE tripdb;
CREATE USER tripuser WITH PASSWORD 'trippass';
GRANT ALL PRIVILEGES ON DATABASE tripdb TO tripuser;
```

5. Connect to the database:

```bash
psql -U postgres
psql -U postgres -d tripdb
```

6. Set schema privileges:

```sql
GRANT USAGE ON SCHEMA public TO tripuser;
GRANT CREATE ON SCHEMA public TO tripuser;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO tripuser;
```

---

## 2. Python Environment Setup

1. Create a virtual environment (use PowerShell):

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Create database tables:

```bash
python create_tables.py
```

---

## 3. Ollama Setup

1. Install Ollama (follow official instructions for your OS).
2. Pull the AI model:

```bash
ollama pull phi3
```

3. Run the model:

```bash
ollama run phi3
```

---

## 4. Run Backend Server

```bash
uvicorn app.main:app --reload
```

---

## Notes / TODO

- The chat API is working.
- **Frontend UI (`AiChat.vue`) needs improvements.**
- User preferences and AI tuning with data are not yet implemented.

```


```
