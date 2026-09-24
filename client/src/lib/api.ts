const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const TOKEN_KEY = "buksu_token";
const USER_KEY = "buksu_active_admin_session";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export interface ApiErrorPayload {
  success: false;
  error: string;
  details?: unknown;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = body as ApiErrorPayload;
    const message = err.error || `Request failed with ${res.status}`;
    // Attach details for debugging
    const error = new Error(message) as Error & { details?: unknown; status?: number };
    error.details = err.details;
    error.status = res.status;
    throw error;
  }

  // Server wraps with { success: true, data: ... }
  // Some endpoints return data directly nested under `data`
  return body as T;
}

export { API_BASE, TOKEN_KEY, USER_KEY };
