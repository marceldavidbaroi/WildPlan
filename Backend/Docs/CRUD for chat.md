# 📘 Chat API Endpoints

## 🧾 Session Endpoints

| Method | Path                        | Purpose                           | Request Payload / Params                                                                 | Response Example |
|--------|-----------------------------|-----------------------------------|-------------------------------------------------------------------------------------------|------------------|
| POST   | `/session`                  | Create a new chat session         | **Body:**<br>`{ "title": str, "mood": str, "style": str }`                                | `201 Created`<br>`{ "session_id": "uuid", "title": "...", "mood": "...", ... }` |
| GET    | `/session/{id}`            | Get a session by ID               | **Path param:** `id`                                                                      | `200 OK`<br>`{ "session_id": "uuid", "title": "...", "mood": "...", ... }` |
| GET    | `/session/user/{uid}`      | Get all sessions for a user       | **Path param:** `uid`                                                                     | `200 OK`<br>`[{ "session_id": "uuid", "title": "...", "mood": "...", ... }, ...]` |
| DELETE | `/session/{id}`            | Delete a session by ID            | **Path param:** `id`                                                                      | `200 OK`<br>`{ "message": "Session deleted" }` |
| PATCH  | `/session/{id}`            | Update session info               | **Body:**<br>`{ "title": str, "mood": str, "style": str }`                                | `200 OK`<br>`{ "message": "Session updated" }` |

---

## 💬 Message Endpoints

| Method | Path                            | Purpose                         | Request Payload / Params                                                                 | Response Example |
|--------|----------------------------------|----------------------------------|-------------------------------------------------------------------------------------------|------------------|
| POST   | `/message`                      | Add a message to a session      | **Body:**<br>`{ "session_id": str, "role": "user\|assistant", "content": str }`           | `201 Created`<br>`{ "message_id": "uuid", "created_at": "timestamp" }` |
| GET    | `/message/session/{session_id}` | Get messages for a session      | **Path param:** `session_id`                                                              | `200 OK`<br>`[{ "id": "uuid", "role": "...", "content": "...", ... }, ...]` |
| DELETE | `/message/{id}`                 | Delete a message by ID          | **Path param:** `id`                                                                      | `200 OK`<br>`{ "message": "Message deleted" }` |

---

## 🤖 Chat Endpoints

| Method | Path                  | Purpose                                       | Request Payload / Params                                                      | Response Example |
|--------|------------------------|-----------------------------------------------|--------------------------------------------------------------------------------|------------------|
| POST   | `/chat`               | Send a message and auto-create session if needed | **Body:**<br>`{ "message": str, "session_id"?: str }`                          | `200 OK`<br>`{ "reply": "...", "session_id": "uuid" }` |
| POST   | `/chat/{session_id}` | Send a message to an existing session         | **Path param:** `session_id`<br>**Body:**<br>`{ "message": str }`              | `200 OK`<br>`{ "reply": "...", "session_id": "uuid" }` |
