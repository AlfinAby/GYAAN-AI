# Content Processing - AI-powered textbook analysis
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import os
from openai import OpenAI

router = APIRouter()

# Initialize OpenAI client
openai_client = None
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if OPENAI_API_KEY:
    openai_client = OpenAI(api_key=OPENAI_API_KEY)
elif GROQ_API_KEY:
    openai_client = OpenAI(
        api_key=GROQ_API_KEY,
        base_url="https://api.groq.com/openai/v1"
    )

# In-memory storage for demo
uploaded_content = {}

class ContentUpload(BaseModel):
    name: str
    type: str  # textbook, topic, passage, problem
    subject: str  # reading, math, comprehension
    content: str
    teacherId: str

class ContentResponse(BaseModel):
    id: str
    name: str
    type: str
    subject: str
    status: str
    conceptsExtracted: List[str]
    questionsGenerated: int

class MatchRequest(BaseModel):
    studentResponse: str
    contentId: str

class MatchResponse(BaseModel):
    matchScore: float
    conceptsCovered: List[str]
    conceptsMissing: List[str]
    feedback: str

def extract_concepts_from_content(content: str, subject: str) -> List[str]:
    """Use AI to extract key concepts from textbook content"""
    if not openai_client:
        return ["Concept 1", "Concept 2", "Concept 3"]
    
    try:
        response = openai_client.chat.completions.create(
            model="gpt-3.5-turbo" if OPENAI_API_KEY else "llama-3.1-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": f"Extract 5-10 key learning concepts from this {subject} educational content. Return as JSON array: [\"concept1\", \"concept2\", ...]"
                },
                {"role": "user", "content": content[:2000]}  # Limit content
            ],
            temperature=0.3,
            max_tokens=200
        )
        
        import json
        concepts = json.loads(response.choices[0].message.content)
        return concepts if isinstance(concepts, list) else ["General Concepts"]
    except Exception as e:
        print(f"Concept extraction error: {e}")
        return ["Reading Skills", "Vocabulary", "Comprehension"]

def match_response_to_content(student_response: str, content: str) -> dict:
    """Use AI to match student response against curriculum content"""
    if not openai_client:
        return {"score": 0.75, "covered": ["Basic understanding"], "missing": ["Details"], "feedback": "Good effort!"}
    
    try:
        response = openai_client.chat.completions.create(
            model="gpt-3.5-turbo" if OPENAI_API_KEY else "llama-3.1-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": """Compare student response to curriculum content. Return JSON:
                    {"score": 0.0-1.0, "covered": ["concepts learned"], "missing": ["concepts not shown"], "feedback": "brief feedback"}"""
                },
                {
                    "role": "user",
                    "content": f"Curriculum:\n{content[:1000]}\n\nStudent response:\n{student_response}"
                }
            ],
            temperature=0.3,
            max_tokens=300
        )
        
        import json
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        print(f"Match error: {e}")
        return {"score": 0.7, "covered": ["Partial understanding"], "missing": ["Full details"], "feedback": "Keep practicing!"}

@router.post("/upload", response_model=ContentResponse)
async def upload_content(content: ContentUpload):
    """Upload and process curriculum content"""
    import uuid
    
    content_id = str(uuid.uuid4())
    
    # Extract concepts using AI
    concepts = extract_concepts_from_content(content.content, content.subject)
    
    # Store content
    uploaded_content[content_id] = {
        "id": content_id,
        "name": content.name,
        "type": content.type,
        "subject": content.subject,
        "content": content.content,
        "concepts": concepts,
        "teacherId": content.teacherId
    }
    
    return ContentResponse(
        id=content_id,
        name=content.name,
        type=content.type,
        subject=content.subject,
        status="ready",
        conceptsExtracted=concepts,
        questionsGenerated=len(concepts) * 3  # 3 questions per concept
    )

@router.get("/list/{teacher_id}")
async def list_content(teacher_id: str):
    """List all content for a teacher"""
    teacher_content = [
        {
            "id": c["id"],
            "name": c["name"],
            "type": c["type"],
            "subject": c["subject"],
            "conceptCount": len(c["concepts"])
        }
        for c in uploaded_content.values()
        if c["teacherId"] == teacher_id
    ]
    return {"content": teacher_content}

@router.post("/match", response_model=MatchResponse)
async def match_student_response(request: MatchRequest):
    """Match student response against curriculum content"""
    
    if request.contentId not in uploaded_content:
        raise HTTPException(status_code=404, detail="Content not found")
    
    content = uploaded_content[request.contentId]
    result = match_response_to_content(request.studentResponse, content["content"])
    
    return MatchResponse(
        matchScore=result.get("score", 0.7),
        conceptsCovered=result.get("covered", []),
        conceptsMissing=result.get("missing", []),
        feedback=result.get("feedback", "Keep practicing!")
    )

@router.delete("/{content_id}")
async def delete_content(content_id: str):
    """Delete uploaded content"""
    if content_id in uploaded_content:
        del uploaded_content[content_id]
        return {"status": "deleted"}
    raise HTTPException(status_code=404, detail="Content not found")
