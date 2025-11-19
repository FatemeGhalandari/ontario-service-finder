const API_BASE_URL = "http://localhost:4000/api";

export async function getServices(params = {}) {
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

  const queryString = searchParams.toString();
  const url = queryString
    ? `${API_BASE_URL}/services?${queryString}`
    : `${API_BASE_URL}/services`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch services");
  return res.json();
}

export async function createService(data) {
  const res = await fetch(`${API_BASE_URL}/services`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    let message = "Failed to create service";

    try {
      const errorBody = await res.json();
      if (errorBody?.error) {
        message = errorBody.error;
      }
      if (errorBody?.details && Array.isArray(errorBody.details)) {
        const fieldMessages = errorBody.details
          .map((d) => (d.path ? `${d.path}: ${d.message}` : d.message))
          .join("; ");
        if (fieldMessages) {
          message = `${message} – ${fieldMessages}`;
        }
      }
    } catch {
      // ignore JSON parse errors, keep default message
    }

    throw new Error(message);
  }

  return res.json();
}

export async function updateService(id, data) {
  const res = await fetch(`${API_BASE_URL}/services/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    throw new Error(errorBody?.error || "Failed to update service");
  }
  return res.json();
}

export async function deleteService(id) {
  const res = await fetch(`${API_BASE_URL}/services/${id}`, {
    method: "DELETE",
  });
  if (!res.ok && res.status !== 204) {
    const errorBody = await res.json().catch(() => null);
    throw new Error(errorBody?.error || "Failed to delete service");
  }
  return true;
}
