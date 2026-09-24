import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";
import { registerBuksuUserApi, isBuksuEmail } from "../services/authService";

export interface RegisterLocationState {
  email?: string;
  name?: string;
  unregisteredNotice?: boolean;
}

export function useAdminRegister() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setDirectSession } = useAdminAuth();

  const locationState = (location.state as RegisterLocationState) || {};
  const stateEmail = locationState.email || "";
  const stateName = locationState.name || "";
  const unregisteredNotice = locationState.unregisteredNotice;

  const [name, setName] = useState(stateName);
  const [studentId, setStudentId] = useState("");
  const [email, setEmail] = useState(stateEmail);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [department, setDepartment] = useState("College of Technologies (COT)");
  const [role, setRole] = useState("SBO Printing Assistant");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (stateEmail) setEmail(stateEmail);
    if (stateName) setName(stateName);
  }, [stateEmail, stateName]);

  const isBuksuDomain = email.trim().toLowerCase().endsWith("@student.buksu.edu.ph");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();
    const trimmedId = studentId.trim();

    if (!trimmedName) {
      setError("Please provide your full name.");
      return;
    }
    if (!trimmedId) {
      setError("Please provide your BukSU Student ID (e.g., 2024-00123).");
      return;
    }
    if (!trimmedEmail) {
      setError("Please enter your BukSU student email.");
      return;
    }
    if (!isBuksuEmail(trimmedEmail)) {
      setError("Registration is restricted to official BukSU student emails (@student.buksu.edu.ph).");
      return;
    }
    if (password && password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (password && password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    setLoading(true);

    try {
      const result = await registerBuksuUserApi({
        name: trimmedName,
        studentId: trimmedId,
        email: trimmedEmail,
        password: password || undefined,
        department,
        role,
        provider: password ? "password" : "google",
      });

      if (!result.success || !result.user) {
        setError(result.error || "Registration failed.");
        setLoading(false);
        return;
      }

      setSuccess("Admin account created successfully! Signing you in...");
      if (result.user) {
        setDirectSession(result.user, result.token);
      }

      setTimeout(() => {
        navigate("/admin/dashboard", { replace: true });
      }, 800);
    } catch (err) {
      console.error("Registration error:", err);
      setError(err instanceof Error ? err.message : "An error occurred during registration.");
      setLoading(false);
    }
  };

  return {
    name,
    setName,
    studentId,
    setStudentId,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    department,
    setDepartment,
    role,
    setRole,
    loading,
    error,
    setError,
    success,
    setSuccess,
    unregisteredNotice,
    isBuksuDomain,
    handleRegister,
  };
}

export default useAdminRegister;
