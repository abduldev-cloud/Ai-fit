#  uvicorn app.main:app --host 0.0.0.0 --port 8000
# python -m app.main

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, users, food_logs
from app.db.session import engine, Base
from app.models.user import User
from app.models.food_log import FoodLog
import os
from dotenv import load_dotenv

load_dotenv()

# Create Database tables (Temporary method - in production use Alembic)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="FitMind AI API",
    description="Backend for AI-powered nutrition coaching",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
app.include_router(food_logs.router, prefix="/api/v1/food", tags=["food"])

@app.get("/")
async def root():
    return {
        "message": "Welcome to FitMind AI API",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
