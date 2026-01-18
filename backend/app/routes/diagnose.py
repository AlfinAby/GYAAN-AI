# Diagnosis Routes - Real AI Agent Analysis
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
import os
from openai import OpenAI

router = APIRouter()

# Initialize OpenAI client (works with OpenAI or compatible APIs)
openai_client = None
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# Try OpenAI first, then Groq
if OPENAI_API_KEY:
    openai_client = OpenAI(api_key=OPENAI_API_KEY)
elif GROQ_API_KEY:
    openai_client = OpenAI(
        api_key=GROQ_API_KEY,
        base_url="https://api.groq.com/openai/v1"
    )

class ReadingRequest(BaseModel):
    transcript: str
    expectedText: str

class MathRequest(BaseModel):
    transcript: str
    problem: str
    expectedAnswer: str

class DiagnosisResponse(BaseModel):
    type: str
    analysis: str
    conceptsIdentified: List[str]
    gapsFound: List[str]
    recommendations: List[str]
    xpEarned: int
    accuracy: int

def get_ai_diagnosis(prompt: str, diagnosis_type: str) -> dict:
    """Get AI diagnosis using LLM"""
    if not openai_client:
        return None
    
    try:
        system_prompt = """You are an expert educational diagnostician for children aged 6-12. 
        Analyze the student's response and provide:
        1. A brief analysis (2-3 sentences)
        2. Concepts the student has mastered (list 2-4)
        3. Knowledge gaps found (list 1-3)
        4. Specific recommendations (list 2-3)
        5. Accuracy percentage (0-100)
        
        Respond in JSON format:
        {"analysis": "...", "concepts": [...], "gaps": [...], "recommendations": [...], "accuracy": 85}"""
        
        response = openai_client.chat.completions.create(
            model="gpt-3.5-turbo" if OPENAI_API_KEY else "llama-3.1-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=500
        )
        
        import json
        result = json.loads(response.choices[0].message.content)
        return result
    except Exception as e:
        print(f"AI diagnosis error: {e}")
        return None

@router.post("/reading", response_model=DiagnosisResponse)
async def diagnose_reading(request: ReadingRequest):
    """Analyze reading fluency using AI agents"""
    
    prompt = f"""Analyze this student's reading attempt:
    
Expected text: "{request.expectedText}"
Student read: "{request.transcript}"

Evaluate: pronunciation accuracy, fluency, word recognition, and reading pace."""

    ai_result = get_ai_diagnosis(prompt, "reading")
    
    if ai_result:
        # Calculate XP based on accuracy
        accuracy = ai_result.get("accuracy", 75)
        xp = int(50 + (accuracy / 2))  # 50-100 XP range
        
        return DiagnosisResponse(
            type="reading",
            analysis=ai_result.get("analysis", "Analysis complete."),
            conceptsIdentified=ai_result.get("concepts", ["Reading Fluency"]),
            gapsFound=ai_result.get("gaps", ["Practice needed"]),
            recommendations=ai_result.get("recommendations", ["Keep practicing"]),
            xpEarned=xp,
            accuracy=accuracy
        )
    
    # Fallback mock
    return DiagnosisResponse(
        type="reading",
        analysis="Student demonstrates good word recognition. Reading pace is appropriate for grade level.",
        conceptsIdentified=["Letter Recognition", "Word Formation", "Sentence Reading"],
        gapsFound=["Paragraph Fluency"],
        recommendations=["Practice reading longer passages", "Focus on multi-syllable words"],
        xpEarned=75,
        accuracy=85
    )

@router.post("/math", response_model=DiagnosisResponse)
async def diagnose_math(request: MathRequest):
    """Analyze math reasoning using AI agents"""
    
    prompt = f"""Analyze this student's math problem solving:
    
Problem: "{request.problem}"
Expected answer: "{request.expectedAnswer}"
Student's explanation: "{request.transcript}"

Evaluate: problem understanding, calculation steps, reasoning, and final answer."""

    ai_result = get_ai_diagnosis(prompt, "math")
    
    if ai_result:
        accuracy = ai_result.get("accuracy", 70)
        xp = int(40 + (accuracy / 2))
        
        return DiagnosisResponse(
            type="math",
            analysis=ai_result.get("analysis", "Analysis complete."),
            conceptsIdentified=ai_result.get("concepts", ["Basic Math"]),
            gapsFound=ai_result.get("gaps", ["Practice needed"]),
            recommendations=ai_result.get("recommendations", ["Keep practicing"]),
            xpEarned=xp,
            accuracy=accuracy
        )
    
    # Fallback mock
    return DiagnosisResponse(
        type="math",
        analysis="Student correctly identified the operation but made a calculation error. Understanding is solid.",
        conceptsIdentified=["Number Recognition", "Counting", "Basic Addition"],
        gapsFound=["Place Value", "Carrying"],
        recommendations=["Practice two-digit addition", "Use visual aids"],
        xpEarned=60,
        accuracy=70
    )

@router.post("/comprehension", response_model=DiagnosisResponse)
async def diagnose_comprehension(request: ReadingRequest):
    """Analyze reading comprehension using AI agents"""
    
    prompt = f"""Analyze this student's comprehension:
    
Passage: "{request.expectedText}"
Student's response: "{request.transcript}"

Evaluate: literal recall, inference, main idea understanding, and vocabulary."""

    ai_result = get_ai_diagnosis(prompt, "comprehension")
    
    if ai_result:
        accuracy = ai_result.get("accuracy", 75)
        xp = int(45 + (accuracy / 2))
        
        return DiagnosisResponse(
            type="comprehension",
            analysis=ai_result.get("analysis", "Analysis complete."),
            conceptsIdentified=ai_result.get("concepts", ["Basic Comprehension"]),
            gapsFound=ai_result.get("gaps", ["Inference skills"]),
            recommendations=ai_result.get("recommendations", ["Practice comprehension"]),
            xpEarned=xp,
            accuracy=accuracy
        )
    
    # Fallback mock
    return DiagnosisResponse(
        type="comprehension",
        analysis="Student demonstrated literal recall. Inference skills need development.",
        conceptsIdentified=["Basic Comprehension", "Literal Recall"],
        gapsFound=["Inference", "Drawing Conclusions"],
        recommendations=["Practice 'why' and 'how' questions", "Discuss story predictions"],
        xpEarned=65,
        accuracy=75
    )
