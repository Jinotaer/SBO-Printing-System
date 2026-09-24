import { apiFetch, getToken, setToken, USER_KEY } from "@/lib/api";

export interface RegisteredUser {
  id: string;
  name: string;
  studentId: string;
  email: string;
  role: string;
  department: string;
  avatar?: string;
  createdAt: string;
  provider: "google" | "password";
}

export interface AuthResponseData {
  user: RegisteredUser;
  token: string;
}

export function isBuksuEmail(email: string): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return /^[a-zA-Z0-9._%+-]+@student\.buksu\.edu\.ph$/i.test(normalized);
}

export function getActiveSession(): RegisteredUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as RegisteredUser) : null;
  } catch {
    return null;
  }
}

export function setActiveSession(user: RegisteredUser | null): void {
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(USER_KEY);
}

// --- Real Server APIs (No mock data) ---

export async function registerBuksuUserApi(payload: {
  name: string;
  studentId: string;
  email: string;
  password?: string;
  department?: string;
  role?: string;
  provider?: "google" | "password";
}): Promise<{ success: boolean; error?: string; user?: RegisteredUser; token?: string }> {
  try {
    const body = await apiFetch<{ success: true; data: AuthResponseData }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: payload.name,
        studentId: payload.studentId,
        email: payload.email,
        ...(payload.password ? { password: payload.password } : {}),
        department: payload.department,
        role: payload.role,
        provider: payload.provider || "password",
      }),
    });

    const { user, token } = body.data;
    setToken(token);
    setActiveSession(user);
    return { success: true, user, token };
  } catch (e) {
    const err = e as Error & { details?: unknown };
    return { success: false, error: err.message };
  }
}

export async function loginBuksuUserApi(payload: {
  email: string;
  password?: string;
  googleLogin?: boolean;
}): Promise<{ success: boolean; error?: string; user?: RegisteredUser; token?: string; isUnregistered?: boolean }> {
  try {
    const body = await apiFetch<{ success: true; data: AuthResponseData }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const { user, token } = body.data;
    setToken(token);
    setActiveSession(user);
    return { success: true, user, token };
  } catch (e) {
    const err = e as Error & { status?: number };
    if (err.status === 404) {
      return { success: false, isUnregistered: true, error: err.message };
    }
    return { success: false, error: err.message };
  }
}

export async function googleLoginWithIdTokenApi(
  idToken: string,
  recaptchaToken?: string | null
): Promise<{
  success: boolean;
  error?: string;
  user?: RegisteredUser;
  token?: string;
  isUnregistered?: boolean;
}> {
  try {
    const body = await apiFetch<{ success: true; data: AuthResponseData }>("/auth/google", {
      method: "POST",
      body: JSON.stringify({ idToken, ...(recaptchaToken ? { recaptchaToken } : {}) }),
    });
    const { user, token } = body.data;
    setToken(token);
    setActiveSession(user);
    return { success: true, user, token };
  } catch (e) {
    const err = e as Error & { status?: number };
    if (err.status === 404) {
      return { success: false, isUnregistered: true, error: err.message };
    }
    return { success: false, error: err.message };
  }
}

export async function forgotPasswordApi(
  email: string
): Promise<{ success: boolean; error?: string; message?: string }> {
  try {
    const body = await apiFetch<{ success: true; data: { message: string } }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    return { success: true, message: body.data.message };
  } catch (e) {
    const err = e as Error;
    return { success: false, error: err.message };
  }
}

export async function resetPasswordApi(
  token: string,
  password: string
): Promise<{ success: boolean; error?: string; message?: string }> {
  try {
    const body = await apiFetch<{ success: true; data: { message: string } }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    });
    return { success: true, message: body.data.message };
  } catch (e) {
    const err = e as Error;
    return { success: false, error: err.message };
  }
}

export async function fetchMe(): Promise<RegisteredUser | null> {
  const token = getToken();
  if (!token) return null;
  try {
    const body = await apiFetch<{ success: true; data: { user: RegisteredUser } }>("/auth/me", {
      method: "GET",
    });
    const user = body.data.user;
    setActiveSession(user);
    return user;
  } catch {
    setToken(null);
    setActiveSession(null);
    return null;
  }
}

export async function logoutApi(): Promise<void> {
  const token = getToken();
  if (token) {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
  }
  setToken(null);
  setActiveSession(null);
}
