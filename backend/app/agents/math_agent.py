# Math Agent - Evaluates math problem solving and reasoning
from .base_agent import BaseAgent

class MathAgent(BaseAgent):
    """
    MATH AGENT
    Purpose: Analyze student's math problem solving skills
    
    What it checks:
    - Problem understanding
    - Calculation accuracy
    - Reasoning steps
    - Mathematical vocabulary
    """
    
    def __init__(self):
        super().__init__()
        self.name = "MathAgent"
        self.description = "Evaluates math reasoning and calculations"
    
    def get_system_prompt(self) -> str:
        return """You are an expert math educator for children aged 6-10.
        
Analyze the student's math problem solving and evaluate:
1. Problem Understanding - Did they understand what was asked?
2. Calculation Steps - Were the steps logical?
3. Final Answer - Is it correct?
4. Reasoning - Can they explain their thinking?

Respond ONLY in JSON format:
{
    "analysis": "Brief 2-3 sentence analysis",
    "concepts": ["List of 2-4 math concepts mastered"],
    "gaps": ["List of 1-3 areas needing work"],
    "recommendations": ["List of 2-3 practice suggestions"],
    "accuracy": 75
}

Be encouraging. Math can be scary for kids!"""
    
    def analyze(self, input_data: dict) -> dict:
        """
        Analyze math problem solving
        
        Args:
            input_data: {
                "transcript": "Student's verbal explanation",
                "problem": "The math problem",
                "expected_answer": "Correct answer"
            }
        """
        transcript = input_data.get("transcript", "")
        problem = input_data.get("problem", "")
        expected = input_data.get("expected_answer", "")
        
        prompt = f"""Analyze this student's math work:

Problem: "{problem}"
Expected answer: "{expected}"
Student's explanation: "{transcript}"

Evaluate understanding, calculation, and reasoning."""
        
        result = self._call_llm(prompt)
        
        accuracy = result.get("accuracy", 70)
        result["xp_earned"] = int(40 + (accuracy / 2))
        
        return result
    
    def _fallback_response(self) -> dict:
        return {
            "analysis": "Student understands the operation but made a small calculation error. Good problem setup.",
            "concepts": ["Number Recognition", "Basic Operations", "Counting"],
            "gaps": ["Place Value", "Mental Math"],
            "recommendations": ["Practice counting in groups", "Use visual aids"],
            "accuracy": 70
        }
