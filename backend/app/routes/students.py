# Student Routes
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

class StudentProgress(BaseModel):
    id: str
    username: str
    xp: int
    level: int
    rageProgress: int
    conceptsMastered: List[str]

class ConceptStatus(BaseModel):
    id: str
    name: str
    category: str
    status: str  # mastered, learning, locked
    xpReward: int

@router.get("/{student_id}/progress", response_model=StudentProgress)
async def get_student_progress(student_id: str):
    """
    Get student's learning progress
    """
    # In production, fetch from Supabase database
    return StudentProgress(
        id=student_id,
        username="Student",
        xp=320,
        level=4,
        rageProgress=320,
        conceptsMastered=["c1", "c2", "m1", "m2", "comp1"]
    )

@router.get("/{student_id}/concepts", response_model=List[ConceptStatus])
async def get_student_concepts(student_id: str):
    """
    Get all concepts with status for a student
    """
    return [
        ConceptStatus(id="c1", name="Letter Recognition", category="reading", status="mastered", xpReward=50),
        ConceptStatus(id="c2", name="Word Formation", category="reading", status="mastered", xpReward=75),
        ConceptStatus(id="c3", name="Sentence Reading", category="reading", status="learning", xpReward=100),
        ConceptStatus(id="m1", name="Number Recognition", category="math", status="mastered", xpReward=50),
        ConceptStatus(id="m2", name="Counting", category="math", status="mastered", xpReward=75),
        ConceptStatus(id="m3", name="Addition", category="math", status="learning", xpReward=100),
    ]

@router.get("/{student_id}/rage-meter")
async def get_rage_meter(student_id: str):
    """
    Get student's current rage meter status
    """
    return {
        "rageProgress": 320,
        "rageThreshold": 500,
        "percentComplete": 64,
        "rewardAvailable": False
    }

@router.post("/{student_id}/xp")
async def add_xp(student_id: str, amount: int):
    """
    Add XP to student after completing a challenge
    """
    # In production, update Supabase database
    return {
        "message": f"Added {amount} XP to student {student_id}",
        "newTotal": 320 + amount
    }
