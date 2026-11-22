// All communication with the backend lives in this file.
const BASE_URL = "/api";

export class ApiError extends Error {
  constructor(message, status = 0, errors = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors; // field-level errors from backend validation
  }
}

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch {
    throw new ApiError("Cannot reach the server. Please check that the backend is running on port 5000.");
  }

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    if (!body && response.status >= 500) {
      throw new ApiError("Cannot reach the server. Please check that the backend is running on port 5000.", response.status);
    }
    throw new ApiError(body?.message || `Request failed (${response.status})`, response.status, body?.errors || {});
  }
  return body;
}

export function getLeads({ search = "", status = "", page = 1, limit = 10 } = {}) {
  const params = new URLSearchParams({ page, limit });
  if (search) params.set("search", search);
  if (status) params.set("status", status);
  return request(`/leads?${params.toString()}`);
}

export const getStats = () => request("/dashboard/stats");
export const createLead = (data) => request("/leads", { method: "POST", body: JSON.stringify(data) });
export const updateLead = (id, data) => request(`/leads/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteLead = (id) => request(`/leads/${id}`, { method: "DELETE" });
