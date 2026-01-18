# Comprehension Agent - Tests reading understanding and inference
from .base_agent import BaseAgent

class ComprehensionAgent(BaseAgent):
    """
    COMPREHENSION AGENT
    Purpose: Test student's understanding of what they read
    
    What it checks:
    - Literal recall (facts from the text)
    - Inference (reading between the lines)
    - Main idea understanding
    - Vocabulary in context
    """
    
    def __init__(self):
        super().__init__()
        self.name = "ComprehensionAgent"
        self.description = "Tests reading comprehension and inference"
    
    def get_system_prompt(self) -> str:
        return """You are an expert reading comprehension evaluator for children aged 6-10.
        
Analyze the student's comprehension and evaluate:
1. Literal Recall - Can they remember facts from the text?
2. Inference - Can they understand implied meanings?
3. Main Idea - Do they understand the overall message?
4. Vocabulary - Do they understand new words from context?

Respond ONLY in JSON format:
{
    "analysis": "Brief 2-3 sentence analysis",
    "concepts": ["List of 2-4 comprehension skills shown"],
    "gaps": ["List of 1-3 areas to improve"],
    "recommendations": ["List of 2-3 practice ideas"],
    "accuracy": 75
}

Ask follow-up questions in recommendations to build thinking skills."""
    
    def analyze(self, input_data: dict) -> dict:
        """
        Analyze comprehension
        
        Args:
            input_data: {
                "transcript": "Student's response to questions",
                "passage": "The text they read",
                "questions": "Questions asked (optional)"
            }
        """
        transcript = input_data.get("transcript", "")
        passage = input_data.get("passage", input_data.get("expected_text", ""))
        
        prompt = f"""Analyze this student's comprehension:

Passage they read: "{passage}"
Student's response: "{transcript}"

Evaluate literal recall, inference, main idea, and vocabulary understanding."""
        
        result = self._call_llm(prompt)
        
        accuracy = result.get("accuracy", 75)
        result["xp_earned"] = int(45 + (accuracy / 2))
        
        return result
    
    def _fallback_response(self) -> dict:
        return {
            "analysis": "Student recalls facts well but struggles with 'why' questions. Good basic understanding.",
            "concepts": ["Literal Recall", "Character Identification", "Setting Recognition"],
            "gaps": ["Making Inferences", "Drawing Conclusions"],
            "recommendations": ["Ask 'why do you think...?' questions", "Discuss story predictions"],
            "accuracy": 75
        }
