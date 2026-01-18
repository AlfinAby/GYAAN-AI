# GYAAN-AI Database Models
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, ForeignKey, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class User(Base):
    """Base user model for teachers and students"""
    __tablename__ = "users"
    
    id = Column(String, primary_key=True)
    username = Column(String(100), nullable=False)
    email = Column(String(255), nullable=True)
    role = Column(String(20), nullable=False)  # 'student' or 'teacher'
    section = Column(String(10), nullable=False)
    is_approved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    assessments = relationship("Assessment", back_populates="user")
    progress = relationship("Progress", back_populates="user", uselist=False)


class Assessment(Base):
    """Store assessment results from AI agents"""
    __tablename__ = "assessments"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    agent_type = Column(String(50), nullable=False)  # 'reading', 'math', 'comprehension', 'vocabulary'
    transcript = Column(String, nullable=True)
    expected_text = Column(String, nullable=True)
    analysis = Column(String, nullable=True)
    concepts_identified = Column(JSON, nullable=True)
    gaps_found = Column(JSON, nullable=True)
    recommendations = Column(JSON, nullable=True)
    accuracy = Column(Integer, default=0)
    xp_earned = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="assessments")


class Progress(Base):
    """Track student progress and XP"""
    __tablename__ = "progress"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, unique=True)
    xp = Column(Integer, default=0)
    level = Column(Integer, default=0)
    reading_score = Column(Float, default=0.0)
    math_score = Column(Float, default=0.0)
    comprehension_score = Column(Float, default=0.0)
    vocabulary_score = Column(Float, default=0.0)
    lessons_completed = Column(JSON, default=list)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="progress")


class Lesson(Base):
    """Available lessons and content"""
    __tablename__ = "lessons"
    
    id = Column(String, primary_key=True)
    subject = Column(String(50), nullable=False)  # 'reading', 'math', 'vocabulary'
    language = Column(String(20), default='english')  # 'english', 'hindi', 'malayalam'
    title = Column(String(200), nullable=False)
    content = Column(String, nullable=False)
    example = Column(String, nullable=True)
    level = Column(Integer, default=1)
    xp_reward = Column(Integer, default=25)
    created_at = Column(DateTime, default=datetime.utcnow)
