export async function sendChatMessage(sessionId, messagePayload, token, onChunk) {
  console.log(token);

  // Choose URL depending on whether sessionId is provided
  const url = sessionId ? `http://localhost:8000/chat/${sessionId}` : `http://localhost:8000/chat/`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(messagePayload),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || 'API error');
  }

  const data = await response.json();
  if (data.reply !== undefined) {
    onChunk(data.reply); // send the full response to callback
  }

  return data;
}
