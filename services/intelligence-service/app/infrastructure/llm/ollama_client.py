"""Ollama LLM client — infrastructure adapter for the ILLMClient port."""

from __future__ import annotations

import httpx

from ...application.interfaces.i_llm_client import ILLMClient, LLMResponse


class OllamaClient(ILLMClient):
    """Calls Ollama's HTTP API to generate text completions."""

    def __init__(self, base_url: str = "http://ollama:11434", default_model: str = "llama3.2") -> None:
        self._base_url = base_url.rstrip("/")
        self._default_model = default_model

    async def generate(self, prompt: str, model: str = "") -> LLMResponse:
        model = model or self._default_model
        url = f"{self._base_url}/api/generate"

        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                url,
                json={
                    "model": model,
                    "prompt": prompt,
                    "stream": False,
                },
            )
            response.raise_for_status()
            data = response.json()

        return LLMResponse(
            content=data.get("response", ""),
            model_name=model,
            tokens_used=data.get("eval_count", 0),
        )
