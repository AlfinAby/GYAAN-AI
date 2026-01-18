# GYAAN-AI FastAPI Backend
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

from app.routes import audio, diagnose, students, teacher, content, chatbot

# Create FastAPI app
app = FastAPI(
    title="GYAAN-AI API",
    description="AI-powered learning diagnosis platform API",
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

# Include routers
app.include_router(audio.router, prefix="/api/audio", tags=["Audio"])
app.include_router(diagnose.router, prefix="/api/diagnose", tags=["Diagnosis"])
app.include_router(students.router, prefix="/api/student", tags=["Students"])
app.include_router(teacher.router, prefix="/api/teacher", tags=["Teacher"])
app.include_router(content.router, prefix="/api/content", tags=["Content"])
app.include_router(chatbot.router, prefix="/api/chat", tags=["Chatbot"])

@app.get("/")
async def root():
    return {
        "message": "Welcome to GYAAN-AI API",
        "docs": "/docs",
        "health": "ok"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
