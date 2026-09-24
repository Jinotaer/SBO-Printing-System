import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import {
  type RegisteredUser,
  getActiveSession,
  setActiveSession,
  fetchMe,
  loginBuksuUserApi,
  googleLoginWithIdTokenApi,
  logoutApi,
} from "../services/authService";
import { getToken, setToken } from "@/lib/api";

interface AdminAuthContextType {
  adminUser: RegisteredUser | null;
  loading: boolean;
  initializing: boolean;
  loginWithGoogle: (
    email: string,
    name?: string
  ) => Promise<{ success: boolean; isUnregistered?: boolean; user?: RegisteredUser; error?: string }>;
  loginWithGoogleIdToken: (
    idToken: string,
    recaptchaToken?: string | null
  ) => Promise<{ success: boolean; isUnregistered?: boolean; user?: RegisteredUser; error?: string }>;
  loginWithPassword: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; user?: RegisteredUser; error?: string }>;
  logoutAdmin: () => Promise<void>;
  setDirectSession: (user: RegisteredUser, token?: string) => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [adminUser, setAdminUser] = useState<RegisteredUser | null>(() => getActiveSession());
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  // On mount, if token exists, validate with server
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setInitializing(false);
      return;
    }
    // If we have cached user but want to verify token validity
    void fetchMe()
      .then((user) => {
        if (user) setAdminUser(user);
        else setAdminUser(null);
      })
      .finally(() => setInitializing(false));
  }, []);

  const loginWithGoogle = async (email: string, _name?: string) => {
    setLoading(true);
    try {
      const result = await loginBuksuUserApi({ email, googleLogin: true });
      if (result.success && result.user) {
        setAdminUser(result.user);
        if (result.token) setToken(result.token);
        else if (result.user) setActiveSession(result.user);
      }
      return result;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogleIdToken = async (idToken: string, recaptchaToken?: string | null) => {
    setLoading(true);
    try {
      const result = await googleLoginWithIdTokenApi(idToken, recaptchaToken);
      if (result.success && result.user) {
        setAdminUser(result.user);
        if (result.token) setToken(result.token);
        else if (result.user) setActiveSession(result.user);
      }
      return result;
    } finally {
      setLoading(false);
    }
  };

  const loginWithPassword = async (email: string, password: string) => {
    setLoading(true);
    try {
      const result = await loginBuksuUserApi({ email, password, googleLogin: false });
      if (result.success && result.user) {
        setAdminUser(result.user);
      }
      return result;
    } finally {
      setLoading(false);
    }
  };

  const setDirectSession = (user: RegisteredUser, token?: string) => {
    setAdminUser(user);
    setActiveSession(user);
    if (token) setToken(token);
  };

  const logoutAdmin = async () => {
    setLoading(true);
    try {
      await logoutApi();
    } finally {
      setAdminUser(null);
      setLoading(false);
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        loading,
        initializing,
        loginWithGoogle,
        loginWithGoogleIdToken,
        loginWithPassword,
        logoutAdmin,
        setDirectSession,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth(): AdminAuthContextType {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}

export function AdminRoute({ children }: { children: ReactNode }) {
  const { adminUser, initializing } = useAdminAuth();
  const location = useLocation();

  if (initializing) {
    // Avoid flash redirect while verifying token
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF9]">
        <div className="text-sm text-slate-500 animate-pulse">Verifying session...</div>
      </div>
    );
  }

  if (!adminUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
