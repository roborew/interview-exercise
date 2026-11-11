from typing import Literal

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


Status = Literal["planned", "active", "complete"]


class Project(BaseModel):
    id: int
    name: str
    owner: str
    status: Status


class StatusUpdate(BaseModel):
    status: Status


PROJECTS = [
    Project(id=1, name="Website refresh", owner="Matt", status="active"),
    Project(id=2, name="Onboarding improvements", owner="Brad", status="planned"),
    Project(id=3, name="Reporting dashboard", owner="Priya", status="complete"),
]

app = FastAPI(title="Project Desk API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/projects", response_model=list[Project])
def list_projects() -> list[Project]:
    return PROJECTS


@app.patch("/api/projects/{project_id}", response_model=Project)
def update_project(project_id: int, update: StatusUpdate) -> Project:
    project = next((item for item in PROJECTS if item.id == project_id), None)

    if project is None:
        return Project(id=project_id, name="Unknown project", owner="", status=update.status)

    project.status = update.status
    return project
