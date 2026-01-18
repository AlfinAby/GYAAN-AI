# Progress Agent - Tracks learning path and generates recommendations
from .base_agent import BaseAgent
from typing import List, Dict

class ProgressAgent(BaseAgent):
    """
    PROGRESS AGENT
    Purpose: Track overall student progress and recommend next steps
    
    What it does:
    - Aggregates all assessment scores
    - Calculates overall level
    - Recommends next lessons
    - Identifies patterns in learning
    """
    
    def __init__(self):
        super().__init__()
        self.name = "ProgressAgent"
        self.description = "Tracks progress and recommends learning path"
    
    def get_system_prompt(self) -> str:
        return """You are an expert learning path advisor for children aged 6-10.
        
Based on the student's assessment history:
1. Identify overall strengths and weaknesses
2. Calculate readiness for next level
3. Recommend specific lessons to work on
4. Suggest a balanced learning schedule

Respond ONLY in JSON format:
{
    "analysis": "Overall progress summary",
    "strengths": ["List of strong areas"],
    "focus_areas": ["Areas needing attention"],
    "next_lessons": ["Recommended lesson IDs"],
    "level_progress": 75,
    "ready_for_next_level": false
}

Keep it encouraging and actionable!"""
    
    def analyze(self, input_data: dict) -> dict:
        """
        Analyze overall progress
        
        Args:
            input_data: {
                "assessments": List of past assessment results,
                "current_level": Current student level,
                "xp": Total XP earned
            }
        """
        assessments = input_data.get("assessments", [])
        level = input_data.get("current_level", 0)
        xp = input_data.get("xp", 0)
        
        # Calculate scores by subject
        reading_scores = [a.get("accuracy", 0) for a in assessments if a.get("type") == "reading"]
        math_scores = [a.get("accuracy", 0) for a in assessments if a.get("type") == "math"]
        
        avg_reading = sum(reading_scores) / len(reading_scores) if reading_scores else 0
        avg_math = sum(math_scores) / len(math_scores) if math_scores else 0
        
        prompt = f"""Analyze this student's learning progress:

Current Level: {level}
Total XP: {xp}
Average Reading Score: {avg_reading:.1f}%
Average Math Score: {avg_math:.1f}%
Total Assessments: {len(assessments)}

Provide progress analysis and recommendations."""
        
        result = self._call_llm(prompt)
        
        # Add calculated data
        result["current_level"] = level
        result["total_xp"] = xp
        result["reading_average"] = avg_reading
        result["math_average"] = avg_math
        
        return result
    
    def calculate_level(self, xp: int) -> int:
        """Calculate level from XP"""
        return xp // 200  # Every 200 XP = 1 level
    
    def get_next_lessons(self, strengths: List[str], gaps: List[str]) -> List[str]:
        """Recommend next lessons based on strengths and gaps"""
        lessons = []
        
        # Prioritize gaps but include some strengths for confidence
        if "Reading" in gaps:
            lessons.append("en1")  # English reading
        if "Math" in gaps:
            lessons.append("ml3")  # Math counting
        if "Hindi" in gaps:
            lessons.append("hi1")  # Hindi vowels
            
        return lessons[:3]  # Max 3 recommendations
    
    def _fallback_response(self) -> dict:
        return {
            "analysis": "Student is making steady progress. Strong in basic skills, ready for more challenges.",
            "strengths": ["Reading Fluency", "Number Recognition"],
            "focus_areas": ["Comprehension", "Word Problems"],
            "next_lessons": ["en2", "hi1", "ml1"],
            "level_progress": 60,
            "ready_for_next_level": False
        }
