const DEFAULT_API_BASE_URL = import.meta.env.PROD
  ? "https://ontario-service-finder.onrender.com/api"
  : "http://localhost:4000/api";

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL
).replace(/\/$/, "");

let authToken = null;

export function setAuthToken(token) {
  authToken = token;
}

export function buildAuthHeaders(extra = {}) {
  const headers = { ...extra };
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }
  return headers;
}

export function buildServicesQueryString(params = {}) {
  const searchParams = new URLSearchParams();

  if (params.q && params.q.trim()) {
    searchParams.set("q", params.q.trim());
  }

  if (params.city && params.city.trim()) {
    searchParams.set("city", params.city.trim());
  }

  if (params.category && params.category.trim()) {
    searchParams.set("category", params.category.trim());
  }

  if (params.page) {
    searchParams.set("page", String(params.page));
  }

  if (params.pageSize) {
    searchParams.set("pageSize", String(params.pageSize));
  }

  if (params.sortBy) {
    searchParams.set("sortBy", params.sortBy);
  }

  if (params.sortDirection) {
    searchParams.set("sortDirection", params.sortDirection);
  }

  return searchParams.toString();
}

async function readError(res, fallbackMessage) {
  try {
    const body = await res.json();
    return body?.error || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

export async function getServices(params = {}) {
  const queryString = buildServicesQueryString(params);
  const url = queryString
    ? `${API_BASE_URL}/services?${queryString}`
    : `${API_BASE_URL}/services`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(await readError(res, "Failed to fetch services"));
  }

  return res.json();
}

export async function createService(data) {
  const res = await fetch(`${API_BASE_URL}/services`, {
    method: "POST",
    headers: buildAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error(await readError(res, "Failed to create service"));
  }

  return res.json();
}

export async function updateService(id, data) {
  const res = await fetch(`${API_BASE_URL}/services/${id}`, {
    method: "PUT",
    headers: buildAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error(await readError(res, "Failed to update service"));
  }

  return res.json();
}

export async function deleteService(id) {
  const res = await fetch(`${API_BASE_URL}/services/${id}`, {
    method: "DELETE",
    headers: buildAuthHeaders(),
  });

  if (!res.ok && res.status !== 204) {
    throw new Error(await readError(res, "Failed to delete service"));
  }

  return true;
}
