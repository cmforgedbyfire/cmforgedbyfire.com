# Interviewer AI (Local)

Local, offline-friendly interview UI that asks questions and stores answers.

## Run

```powershell
python interviewer_ai_app\app.py
```

If Python isn't on PATH, try:

```powershell
py interviewer_ai_app\app.py
```

## Notes
- Uses Ollama at http://localhost:11434 for optional follow-up generation.
- Reads questions from `interviewer_ai/question_bank.json`.
- Writes session logs to `interviewer_ai/sessions/`.
