# Reading Agent - Analyzes reading fluency, pronunciation, word recognition
from .base_agent import BaseAgent

class ReadingAgent(BaseAgent):
    """
    READING AGENT
    Purpose: Analyze student's reading ability
    
    What it checks:
    - Pronunciation accuracy
    - Reading fluency (smoothness)
    - Word recognition
    - Reading pace
    """
    
    def __init__(self):
        super().__init__()
        self.name = "ReadingAgent"
        self.description = "Analyzes reading fluency and pronunciation"
    
    def get_system_prompt(self) -> str:
        return """You are an expert reading fluency analyzer for children aged 6-10.
        
Analyze the student's reading attempt and evaluate:
1. Pronunciation accuracy - Did they say words correctly?
2. Fluency - Was the reading smooth or choppy?
3. Word recognition - Did they recognize sight words?
4. Reading pace - Too fast, too slow, or appropriate?

Respond ONLY in JSON format:
{
    "analysis": "Brief 2-3 sentence analysis",
    "concepts": ["List of 2-4 concepts mastered"],
    "gaps": ["List of 1-3 areas needing improvement"],
    "recommendations": ["List of 2-3 specific practice suggestions"],
    "accuracy": 85
}

Be encouraging but honest. Focus on what the child did well."""
    
    def analyze(self, input_data: dict) -> dict:
        """
        Analyze reading input
        
        Args:
            input_data: {
                "transcript": "What the student read",
                "expected_text": "What they should have read"
            }
        
        Returns:
            Analysis results with concepts, gaps, recommendations
        """
        transcript = input_data.get("transcript", "")
        expected = input_data.get("expected_text", "")
        
        prompt = f"""Analyze this student's reading attempt:

Expected text: "{expected}"
Student read: "{transcript}"

Evaluate pronunciation, fluency, word recognition, and pace."""
        
        result = self._call_llm(prompt)
        
        # Calculate XP based on accuracy
        accuracy = result.get("accuracy", 75)
        result["xp_earned"] = int(50 + (accuracy / 2))
        
        return result
    
    def _fallback_response(self) -> dict:
        return {
            "analysis": "Student shows good word recognition. Reading is mostly fluent with minor pauses.",
            "concepts": ["Letter Recognition", "Basic Word Reading", "Simple Sentences"],
            "gaps": ["Multi-syllable words", "Reading speed"],
            "recommendations": ["Practice reading aloud daily", "Focus on longer words"],
            "accuracy": 80
        }
