# Vocabulary Agent - Checks word knowledge and usage
from .base_agent import BaseAgent

class VocabularyAgent(BaseAgent):
    """
    VOCABULARY AGENT
    Purpose: Assess student's vocabulary knowledge
    
    What it checks:
    - Word meaning understanding
    - Word usage in sentences
    - Synonym/antonym knowledge
    - Context clues usage
    """
    
    def __init__(self):
        super().__init__()
        self.name = "VocabularyAgent"
        self.description = "Assesses vocabulary and word usage"
    
    def get_system_prompt(self) -> str:
        return """You are an expert vocabulary assessor for children aged 6-10.
        
Evaluate the student's vocabulary knowledge:
1. Word Meaning - Do they understand what words mean?
2. Word Usage - Can they use words correctly in sentences?
3. Word Relationships - Do they know synonyms, antonyms?
4. Context Clues - Can they figure out new words from context?

Respond ONLY in JSON format:
{
    "analysis": "Brief 2-3 sentence analysis",
    "concepts": ["List of vocabulary skills shown"],
    "gaps": ["List of areas to improve"],
    "recommendations": ["List of ways to build vocabulary"],
    "accuracy": 80
}

Suggest fun ways to learn new words!"""
    
    def analyze(self, input_data: dict) -> dict:
        """
        Analyze vocabulary usage
        
        Args:
            input_data: {
                "transcript": "Student's word usage/explanation",
                "target_words": "Words being tested",
                "context": "Sentence or paragraph context"
            }
        """
        transcript = input_data.get("transcript", "")
        words = input_data.get("target_words", "")
        context = input_data.get("context", "")
        
        prompt = f"""Analyze this student's vocabulary:

Words tested: "{words}"
Context: "{context}"
Student's response: "{transcript}"

Evaluate word meaning, usage, and understanding."""
        
        result = self._call_llm(prompt)
        
        accuracy = result.get("accuracy", 80)
        result["xp_earned"] = int(35 + (accuracy / 2))
        
        return result
    
    def _fallback_response(self) -> dict:
        return {
            "analysis": "Student knows basic vocabulary but struggles with descriptive words. Good noun recognition.",
            "concepts": ["Common Nouns", "Action Verbs", "Basic Adjectives"],
            "gaps": ["Descriptive Words", "Abstract Concepts"],
            "recommendations": ["Play word games daily", "Read picture books with new words"],
            "accuracy": 80
        }
