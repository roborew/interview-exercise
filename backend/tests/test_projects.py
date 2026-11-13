from app.main import app
from fastapi.testclient import TestClient

client = TestClient(app)


def test_projects_can_be_listed():
    response = client.get("/api/projects")

    assert response.status_code == 200
    assert len(response.json()) == 3


def test_unknown_project_is_not_reported_as_updated():
    response = client.patch("/api/projects/999", json={"status": "active"})

    assert response.status_code == 404


def test_status_update_is_persisted():
    response = client.patch("/api/projects/2", json={"status": "active"})

    assert response.status_code == 200
    assert response.json()["status"] == "active"

    listed = client.get("/api/projects")
    project_two = next(p for p in listed.json() if p["id"] == 2)
    assert project_two["status"] == "active"
