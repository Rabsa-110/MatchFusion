import { createContext, useCallback, useContext, useEffect, useState } from "react";
import api from "../api/axios.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // On mount: validate session with backend /api/auth/me
  useEffect(() => {
    const token = localStorage.getItem("matchfusion_token");
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get("/auth/me")
      .then(({ data }) => {
        if (data.success && data.user) {
          setUser(data.user);
          localStorage.setItem("matchfusion_user", JSON.stringify(data.user));
        } else {
          localStorage.removeItem("matchfusion_token");
          localStorage.removeItem("matchfusion_user");
          setUser(null);
        }
      })
      .catch(() => {
        // Token invalid, expired, or backend rejected
        localStorage.removeItem("matchfusion_token");
        localStorage.removeItem("matchfusion_user");
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  /**
   * Register with the backend.
   * @param {string} name
   * @param {string} email
   * @param {string} password
   * @param {string} [confirmPassword]
   * @returns {Promise<{ success: boolean, error?: string, message?: string }>}
   */
  const register = useCallback(async (name, email, password, confirmPassword) => {
    try {
      const { data } = await api.post("/auth/register", {
        name,
        email,
        password,
        confirmPassword,
      });

      if (data.success) {
        localStorage.setItem("matchfusion_token", data.token);
        localStorage.setItem("matchfusion_user", JSON.stringify(data.user));
        setUser(data.user);
        return { success: true, message: data.message };
      }
      return { success: false, error: data.message || "Registration failed" };
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Registration failed. Please check your network connection and try again.";
      return { success: false, error: msg };
    }
  }, []);

  /**
   * Login with the backend.
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{ success: boolean, error?: string, message?: string }>}
   */
  const login = useCallback(async (email, password) => {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      if (data.success) {
        localStorage.setItem("matchfusion_token", data.token);
        localStorage.setItem("matchfusion_user", JSON.stringify(data.user));
        setUser(data.user);
        return { success: true, message: data.message };
      }
      return { success: false, error: data.message || "Invalid credentials" };
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Login failed. Please check your credentials or network connection.";
      return { success: false, error: msg };
    }
  }, []);

  /**
   * Logout and clear session.
   */
  const logout = useCallback(() => {
    api.post("/auth/logout").catch(() => {});
    localStorage.removeItem("matchfusion_token");
    localStorage.removeItem("matchfusion_user");
    setUser(null);
    setProfile(null);
  }, []);

  /**
   * Load detailed user profile and activity from backend.
   */
  const loadProfile = useCallback(async () => {
    if (!user) return null;
    setProfileLoading(true);
    try {
      const { data } = await api.get("/auth/profile");
      if (data.success) {
        setProfile(data.profile);
        return data.profile;
      }
      return null;
    } catch {
      return null;
    } finally {
      setProfileLoading(false);
    }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        profile,
        profileLoading,
        loadProfile,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
