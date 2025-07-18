from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware  # <-- Add this import
from app.api.routes import router

app = FastAPI()

origins = [
    "http://localhost:9001",  # Your frontend origin
    # Add other origins if needed, or "*" to allow all
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],  # or ["*"] for all origins (not recommended for production)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
