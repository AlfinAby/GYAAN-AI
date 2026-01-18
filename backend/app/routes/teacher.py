# Teacher Routes
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

router = APIRouter()

class StudentSummary(BaseModel):
    id: str
    username: str
    level: int
    xp: int
    rageProgress: int
    conceptsMastered: int

class DashboardResponse(BaseModel):
    students: List[StudentSummary]
    classStats: dict

class RewardConfig(BaseModel):
    rageThreshold: int
    rewardType: str
    rewardValue: str
    rewardDescription: str

# In-memory storage for demo
current_reward_config = RewardConfig(
    rageThreshold=500,
    rewardType="bonus_marks",
    rewardValue="5",
    rewardDescription="5 Bonus Marks"
)

@router.get("/dashboard", response_model=DashboardResponse)
async def get_teacher_dashboard():
    """
    Get teacher dashboard with class overview
    """
    students = [
        StudentSummary(id="s1", username="Rahul", level=4, xp=320, rageProgress=320, conceptsMastered=4),
        StudentSummary(id="s2", username="Priya", level=5, xp=480, rageProgress=480, conceptsMastered=6),
        StudentSummary(id="s3", username="Amit", level=3, xp=200, rageProgress=200, conceptsMastered=3),
        StudentSummary(id="s4", username="Sneha", level=6, xp=550, rageProgress=50, conceptsMastered=7),
    ]
    
    class_stats = {
        "totalStudents": len(students),
        "averageXP": sum(s.xp for s in students) // len(students),
        "totalMastered": sum(s.conceptsMastered for s in students),
        "rageReady": sum(1 for s in students if s.rageProgress >= current_reward_config.rageThreshold)
    }
    
    return DashboardResponse(students=students, classStats=class_stats)

@router.get("/students")
async def get_all_students():
    """
    Get all students in the class
    """
    return [
        {"id": "s1", "username": "Rahul", "level": 4, "xp": 320},
        {"id": "s2", "username": "Priya", "level": 5, "xp": 480},
        {"id": "s3", "username": "Amit", "level": 3, "xp": 200},
        {"id": "s4", "username": "Sneha", "level": 6, "xp": 550},
    ]

@router.get("/student/{student_id}")
async def get_student_detail(student_id: str):
    """
    Get detailed view of a specific student for teacher
    """
    return {
        "id": student_id,
        "username": "Student",
        "level": 4,
        "xp": 320,
        "rageProgress": 320,
        "conceptsMastered": ["c1", "c2", "m1", "m2"],
        "recentDiagnoses": [
            {"type": "reading", "date": "2024-01-15", "accuracy": 85},
            {"type": "math", "date": "2024-01-14", "accuracy": 70}
        ],
        "gapsIdentified": ["Place Value", "Paragraph Fluency"]
    }

@router.get("/rewards", response_model=RewardConfig)
async def get_reward_config():
    """
    Get current reward configuration
    """
    return current_reward_config

@router.post("/rewards", response_model=RewardConfig)
async def update_reward_config(config: RewardConfig):
    """
    Update reward configuration
    """
    global current_reward_config
    current_reward_config = config
    return current_reward_config
