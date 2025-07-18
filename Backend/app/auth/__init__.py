import firebase_admin
from firebase_admin import credentials, auth as firebase_auth
from fastapi import HTTPException, Request
from app.config import FIREBASE_KEY_PATH

cred = credentials.Certificate(FIREBASE_KEY_PATH)
firebase_admin.initialize_app(cred)

async def verify_token(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Missing Authorization header")
    id_token = auth_header.split("Bearer ")[-1]
    try:
        decoded_token = firebase_auth.verify_id_token(id_token)
        return decoded_token["uid"]
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
