import { createContext, useCallback, useContext, useEffect, useState } from "react";
import api from "../api/axios.js";

// Real auth context — calls the backend JWT/bcrypt API.
// Falls back gracefully when the backend is unreachable.
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: restore user from stored token
  useEffect(() => {
    const token = localStorage.getItem("matchfusion_token");
    const storedUser = localStorage.getItem("matchfusion_user");

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("matchfusion_token");
        localStorage.removeItem("matchfusion_user");
      }
    }
    setLoading(false);
  }, []);

  /**
   * Register with the real backend.
   * Returns { success, error? }
   */
  const register = useCallback(async (name, email, password) => {
    try {
      const { data } = await api.post("/auth/register", { name, email, password });
      if (data.success) {
        localStorage.setItem("matchfusion_token", data.token);
        localStorage.setItem("matchfusion_user", JSON.stringify(data.user));
        setUser(data.user);
        return { success: true };
      }
      return { success: false, error: data.message };
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Registration failed. Is the backend running? Check http://localhost:5000/api/health";
      return { success: false, error: msg };
    }
  }, []);

  /**
   * Login with the real backend.
   * Returns { success, error? }
   */
  const login = useCallback(async (email, password) => {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      if (data.success) {
        localStorage.setItem("matchfusion_token", data.token);
        localStorage.setItem("matchfusion_user", JSON.stringify(data.user));
        setUser(data.user);
        return { success: true };
      }
      return { success: false, error: data.message };
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Login failed. Is the backend running? Check http://localhost:5000/api/health";
      return { success: false, error: msg };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("matchfusion_token");
    localStorage.removeItem("matchfusion_user");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
