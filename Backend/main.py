from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware

import firebase_admin
from firebase_admin import credentials, auth
import os

from dotenv import load_dotenv
load_dotenv()

cred = credentials.Certificate(os.getenv("GOOGLE_APPLICATION_CREDENTIALS"))
firebase_admin.initialize_app(cred)

app = FastAPI()

# 👇 Add this
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:9000"],  # 👈 Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "API is working"}

@app.post("/chat")
async def chat(authorization: str = Header(...)):
    id_token = authorization.split("Bearer ")[-1]

    try:
        decoded_token = auth.verify_id_token(id_token)
        uid = decoded_token["uid"]
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token")

    # For now, return a mock response
    return {"reply": "This is a mock AI response!", "user_id": uid}
