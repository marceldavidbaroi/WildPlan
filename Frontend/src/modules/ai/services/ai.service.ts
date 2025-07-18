export async function sendChatMessage(sessionId, messagePayload, token, onChunk) {
  const response = await fetch(`http://localhost:8001/chat/${sessionId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(messagePayload),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || 'API error');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // Split by newlines in case multiple JSON objects are received at once
    const lines = buffer.split('\n');
    buffer = lines.pop() || ''; // Save last (possibly incomplete) line for next chunk

    for (const line of lines) {
      if (!line.trim()) continue;

      try {
        const parsed = JSON.parse(line);
        if (parsed.response !== undefined) {
          onChunk(parsed.response);
        }
      } catch (err) {
        console.error('Failed to parse chunk line:', line, err);
      }
    }
  }

  // Final flush if buffer has a complete JSON
  if (buffer.trim()) {
    try {
      const parsed = JSON.parse(buffer);
      if (parsed.response !== undefined) {
        onChunk(parsed.response);
      }
    } catch (err) {
      console.error('Failed to parse final buffer:', buffer, err);
    }
  }
}
