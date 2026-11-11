# Lead Full-Stack Engineer Interview Exercise

This is a small project-management app using FastAPI and React.

The repository is intentionally imperfect. It contains some technical debt and a bug in the project-status update flow. You are not expected to clean up the whole codebase.

## Running the API

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Running the frontend

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173.

## The task

Users report that changing a project's status sometimes appears to work, but the old status comes back after refreshing. They also do not always see a useful error when an update fails.

Please investigate the relevant frontend and API path, fix the behaviour, and make one small improvement to the loading/error experience. Add or update a meaningful test if time allows.

You may use an AI coding tool during the implementation. You remain responsible for understanding, reviewing and verifying any code it helps produce.

You are not expected to refactor unrelated code or find every issue in the repository.
