import { createContext, useContext, useEffect, useState } from "react";

// Lightweight client-side auth context so the UI flow (login → profile menu →
// logout) can be demoed end-to-end before the real JWT/bcrypt backend auth
// (see backend/routes/auth.js) is wired up. See PROGRESS.md — this is a
// front-end placeholder only, it does not perform real authentication.
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("matchfusion_demo_user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const login = (name, email) => {
    const demoUser = { name, email };
    localStorage.setItem("matchfusion_demo_user", JSON.stringify(demoUser));
    setUser(demoUser);
  };

  const logout = () => {
    localStorage.removeItem("matchfusion_demo_user");
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
