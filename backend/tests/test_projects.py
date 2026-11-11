from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_projects_can_be_listed():
    response = client.get("/api/projects")

    assert response.status_code == 200
    assert len(response.json()) == 3


def test_unknown_project_is_not_reported_as_updated():
    response = client.patch("/api/projects/999", json={"status": "active"})

    assert response.status_code == 404
