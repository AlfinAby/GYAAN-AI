# Chatbot Routes - Gemini AI Student Assistant
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
import os
import google.generativeai as genai

router = APIRouter()

# Initialize Gemini
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)

# Fallback to Groq if no Gemini key
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    message: str
    context: Optional[str] = None  # Current subject/topic
    history: List[ChatMessage] = []

class ChatResponse(BaseModel):
    reply: str
    suggestions: List[str]

# System prompt for student helper
SYSTEM_PROMPT = """You are GYAAN, a friendly AI tutor for children aged 6-12 learning in rural India.

Your role:
- Help students understand difficult concepts in simple words
- Explain reading passages and math problems step-by-step
- Give encouraging feedback and celebrate their efforts
- Use examples from everyday Indian life (farms, markets, festivals)
- Keep responses SHORT (2-3 sentences max for young kids)
- If a student is frustrated, be extra kind and supportive

Current context: {context}

Remember: You're talking to a child. Be patient, simple, and encouraging!"""

def get_gemini_response(message: str, context: str, history: list) -> str:
    """Get response from Gemini AI"""
    if not GOOGLE_API_KEY:
        return None
    
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Build conversation
        chat = model.start_chat(history=[
            {"role": h.role, "parts": [h.content]}
            for h in history[-6:]  # Last 6 messages for context
        ])
        
        # Add system context
        prompt = f"[Context: {context}]\n\nStudent asks: {message}"
        
        response = chat.send_message(
            SYSTEM_PROMPT.format(context=context) + "\n\n" + prompt
        )
        
        return response.text
    except Exception as e:
        print(f"Gemini error: {e}")
        return None

def get_groq_response(message: str, context: str, history: list) -> str:
    """Fallback to Groq LLaMA if Gemini not available"""
    if not GROQ_API_KEY:
        return None
    
    try:
        from openai import OpenAI
        client = OpenAI(
            api_key=GROQ_API_KEY,
            base_url="https://api.groq.com/openai/v1"
        )
        
        messages = [{"role": "system", "content": SYSTEM_PROMPT.format(context=context)}]
        for h in history[-6:]:
            messages.append({"role": h.role, "content": h.content})
        messages.append({"role": "user", "content": message})
        
        response = client.chat.completions.create(
            model="llama-3.1-70b-versatile",
            messages=messages,
            temperature=0.7,
            max_tokens=200
        )
        
        return response.choices[0].message.content
    except Exception as e:
        print(f"Groq chat error: {e}")
        return None

@router.post("/ask", response_model=ChatResponse)
async def chat_with_assistant(request: ChatRequest):
    """Chat with GYAAN AI assistant"""
    
    context = request.context or "general learning"
    
    # Try Gemini first, then Groq
    reply = get_gemini_response(request.message, context, request.history)
    if not reply:
        reply = get_groq_response(request.message, context, request.history)
    
    # Fallback response
    if not reply:
        reply = "I'm here to help! Could you tell me more about what you're working on? Are you doing reading or math today?"
    
    # Generate helpful suggestions based on context
    suggestions = []
    if "math" in context.lower():
        suggestions = ["Show me step by step", "Give me a hint", "Try an easier problem"]
    elif "reading" in context.lower():
        suggestions = ["Explain this word", "Read it slower", "What happens next?"]
    else:
        suggestions = ["Help with reading", "Help with math", "I'm stuck"]
    
    return ChatResponse(reply=reply, suggestions=suggestions)

@router.post("/encourage")
async def get_encouragement():
    """Get encouraging message for struggling student"""
    messages = [
        "You're doing great! Every warrior started as a beginner. Keep trying! 💪",
        "Mistakes help us learn. The best students make lots of mistakes and try again!",
        "I believe in you! Take a deep breath and let's try one more time together.",
        "You've already learned so much! This is just one more step on your journey.",
        "Even Kratos had to practice. Every try makes you stronger! ⚔️"
    ]
    import random
    return {"message": random.choice(messages)}
