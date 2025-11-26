import { API_BASE_URL, buildAuthHeaders } from "./services";

export async function getAdminStats() {
  const res = await fetch(`${API_BASE_URL}/admin/stats`, {
    headers: buildAuthHeaders(),
  });

  if (!res.ok) {
    let message = "Failed to load admin stats";
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  return res.json(); // { totalServices, byCity, byCategory }
}
