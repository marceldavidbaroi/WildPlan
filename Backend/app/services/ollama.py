import json
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
                    print(f"🛑 Ollama API error: {e.response.status_code}")
                    yield "[Error: Ollama failed to generate a response. Try again later.]"
                    return

                async for chunk in response.aiter_lines():
                    if not chunk.strip():
                        continue
                    try:
                        data = json.loads(chunk)
                        if "response" in data:
                            yield data["response"]
                    except json.JSONDecodeError as decode_error:
                        print(f"⚠️ Failed to parse chunk: {chunk} — {decode_error}")

        except Exception as e:
            print(f"🛑 Unexpected error during Ollama request: {str(e)}")
            yield "[Unexpected error. Please try again.]"
