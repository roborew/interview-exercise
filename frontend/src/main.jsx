import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const API_URL = "http://localhost:8000/api";


export function ProjectRow({ project, onStatusChange, setError }) {
  const [status, setStatus] = useState(project.status);

  async function handleStatusChange(event) {
    const nextStatus = event.target.value;
    setStatus(nextStatus);

    try {
      const response = await fetch(`${API_URL}/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!response.ok) throw new Error(`Update failed (${response.status})`);
      onStatusChange(project.id, nextStatus); // only applied after the server confirms
    } catch (error) {
      setError({
        message: `Could not save the status change to ${project.name}: ${error.message}. Changes have been reverted.`,
      });
      setStatus(project.status);
      console.error(error);
    }
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

export function App() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/projects`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(setProjects)
      .catch((error) => {
        console.error(error);
        setError({ message: `Could not load projects: ${error.message}` });
      })
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
      {error ? <p>Error: {error.message}</p> : null}
      <ul>
        {projects.map((project) => (
          <ProjectRow
            key={project.id}
            project={project}
            onStatusChange={updateProject}
            setError={setError}
          />
        ))}
      </ul>
    </main>
  );
}

const rootElement = document.getElementById("root");

// Guarded so this module can also be imported by the tests, where no
// #root element exists in the DOM.
if (rootElement) {
  createRoot(rootElement).render(<App />);
}
