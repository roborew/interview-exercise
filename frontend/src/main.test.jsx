import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";

import { App, ProjectRow } from "./main";

const projects = [
  { id: 1, name: "Website refresh", owner: "Matt", status: "active" },
  { id: 2, name: "Onboarding improvements", owner: "Brad", status: "planned" },
];

function apiResponse(body, { ok = true, status = 200 } = {}) {
  return {
    ok,
    status,
    json: () => Promise.resolve(body),
  };
}

function renderRow(project, props = {}) {
  const onStatusChange = vi.fn();
  const setError = vi.fn();
  render(
    <ul>
      <ProjectRow
        project={project}
        onStatusChange={onStatusChange}
        setError={setError}
        {...props}
      />
    </ul>,
  );
  return { onStatusChange, setError, select: screen.getByRole("combobox") };
}

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  cleanup();
});

describe("App", () => {
  it("renders the projects after loading", async () => {
    fetch.mockResolvedValue(apiResponse(projects));

    render(<App />);

    await screen.findByText("Website refresh");
    expect(screen.getByText("Onboarding improvements")).toBeTruthy();
    expect(screen.getByText("Brad")).toBeTruthy(); // owner is shown too
    expect(fetch).toHaveBeenCalledWith("http://localhost:8000/api/projects");
    expect(screen.queryByText("Loading projects...")).toBeNull();
  });

  it("shows an error instead of the list when loading fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => { });
    fetch.mockResolvedValue(
      apiResponse({ detail: "Internal Server Error" }, { ok: false, status: 500 }),
    );

    render(<App />);

    await screen.findByText(/HTTP error! status: 500/);
    expect(screen.queryByText("Loading projects...")).toBeNull();
    expect(screen.queryByRole("combobox")).toBeNull();
  });
});

describe("ProjectRow", () => {
  it("patches the API and keeps the new status when the update succeeds", async () => {
    const { onStatusChange, setError, select } = renderRow(projects[1]);
    fetch.mockResolvedValue(apiResponse({ ...projects[1], status: "active" }));

    expect(select.value).toBe("planned");
    fireEvent.change(select, { target: { value: "active" } });

    await waitFor(() => expect(onStatusChange).toHaveBeenCalledWith(2, "active"));
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:8000/api/projects/2",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ status: "active" }),
      }),
    );
    expect(select.value).toBe("active");
    expect(setError).not.toHaveBeenCalled();
  });

  it("reverts the status and reports an error when the update fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => { });
    const { onStatusChange, setError, select } = renderRow(projects[1]);
    fetch.mockResolvedValue(
      apiResponse({ detail: "Internal Server Error" }, { ok: false, status: 500 }),
    );

    fireEvent.change(select, { target: { value: "complete" } });

    await waitFor(() => expect(setError).toHaveBeenCalledTimes(1));

    const { message } = setError.mock.calls[0][0];
    expect(message).toContain("Onboarding improvements");
    expect(message).toContain("Update failed (500)"); // the reason is surfaced
    expect(message).toContain("reverted");
    expect(select.value).toBe("planned"); // rolled back to the server's truth
    expect(onStatusChange).not.toHaveBeenCalled();
    // Guards against a catch handler that references an undefined `error`
    // binding (which would throw a ReferenceError before logging).
    expect(console.error).toHaveBeenCalledWith(expect.any(Error));
  });
});
