"""Port for LLM client — domain doesn't know about Ollama."""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass(frozen=True)
class LLMResponse:
    content: str
    model_name: str
    tokens_used: int


class ILLMClient(ABC):
    @abstractmethod
    async def generate(self, prompt: str, model: str = "") -> LLMResponse:
        """Send a prompt to the LLM and return the response."""
        ...
