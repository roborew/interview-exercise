import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const API_URL = "http://localhost:8000/api";

function ProjectRow({ project, onStatusChange }) {
  const [status, setStatus] = useState(project.status);

  async function handleStatusChange(event) {
    const nextStatus = event.target.value;
    setStatus(nextStatus);

    await fetch(`${API_URL}/projects/${project.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });

    onStatusChange(project.id, nextStatus);
  }

  return (
    <li className="project-row">
      <div>
        <strong>{project.name}</strong>
        <span>{project.owner}</span>
      </div>
      <select value={status} onChange={handleStatusChange}>
        <option value="planned">Planned</option>
        <option value="active">Active</option>
        <option value="complete">Complete</option>
      </select>
    </li>
  );
}

function App() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/projects`)
      .then((response) => response.json())
      .then(setProjects)
      .finally(() => setLoading(false));
  }, []);

  function updateProject(id, status) {
    setProjects((current) =>
      current.map((project) =>
        project.id === id ? { ...project, status } : project,
      ),
    );
  }

  return (
    <main>
      <h1>Project Desk</h1>
      <p>Update project status and keep the team informed.</p>
      {loading ? <p>Loading projects...</p> : null}
      <ul>
        {projects.map((project) => (
          <ProjectRow
            key={project.id}
            project={project}
            onStatusChange={updateProject}
          />
        ))}
      </ul>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
