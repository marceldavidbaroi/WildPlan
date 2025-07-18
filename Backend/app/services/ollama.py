import httpx

async def ollama_stream(prompt: str):
    async with httpx.AsyncClient(timeout=None) as client:
        try:
            async with client.stream(
                "POST",
                "http://localhost:11434/api/generate",
                json={"model": "phi3", "prompt": prompt}
            ) as response:
                try:
                    response.raise_for_status()
                except httpx.HTTPStatusError as e:
                    # You CANNOT use .text or .content here
                    print(f"🛑 Ollama API error: {e.response.status_code}")
                    yield "[Error: Ollama failed to generate a response. Try again later.]\n"
                    return

                async for chunk in response.aiter_lines():
                    yield chunk + "\n"

        except Exception as e:
            print(f"🛑 Unexpected error during Ollama request: {str(e)}")
            yield "[Unexpected error. Please try again.]\n"
