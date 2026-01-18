# Base Agent Class
from abc import ABC, abstractmethod
from openai import OpenAI
import os
import json

class BaseAgent(ABC):
    """Base class for all GYAAN-AI agents"""
    
    def __init__(self):
        self.client = self._get_client()
        self.name = "BaseAgent"
        self.description = "Base agent class"
    
    def _get_client(self):
        """Get OpenAI or Groq client"""
        openai_key = os.getenv("OPENAI_API_KEY")
        groq_key = os.getenv("GROQ_API_KEY")
        
        if openai_key:
            return OpenAI(api_key=openai_key)
        elif groq_key:
            return OpenAI(api_key=groq_key, base_url="https://api.groq.com/openai/v1")
        return None
    
    def _get_model(self):
        """Get model name based on available API"""
        if os.getenv("OPENAI_API_KEY"):
            return "gpt-3.5-turbo"
        return "llama-3.1-70b-versatile"
    
    @abstractmethod
    def get_system_prompt(self) -> str:
        """Return the system prompt for this agent"""
        pass
    
    @abstractmethod
    def analyze(self, input_data: dict) -> dict:
        """Analyze input and return results"""
        pass
    
    def _call_llm(self, prompt: str) -> dict:
        """Make LLM API call and parse response"""
        if not self.client:
            return self._fallback_response()
        
        try:
            response = self.client.chat.completions.create(
                model=self._get_model(),
                messages=[
                    {"role": "system", "content": self.get_system_prompt()},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=500
            )
            
            content = response.choices[0].message.content
            return json.loads(content)
        except Exception as e:
            print(f"[{self.name}] Error: {e}")
            return self._fallback_response()
    
    def _fallback_response(self) -> dict:
        """Return fallback response when API unavailable"""
        return {
            "analysis": "Analysis complete (demo mode).",
            "concepts": ["Basic Understanding"],
            "gaps": ["Practice needed"],
            "recommendations": ["Keep practicing"],
            "accuracy": 75
        }
