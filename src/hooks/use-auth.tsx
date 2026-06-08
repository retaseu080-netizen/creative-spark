import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";

export type Role = "admin" | "operator";

export interface User {
  id: string;
  email: string;
  role: Role;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem("auth_user");
    if (saved) {
      const parsedUser = JSON.parse(saved);
      setUser(parsedUser);
      updateStatus(parsedUser.id, "online");
    }

    const handleBeforeUnload = () => {
      const currentUser = localStorage.getItem("auth_user");
      if (currentUser) {
        const parsed = JSON.parse(currentUser);
        updateStatus(parsed.id, "offline");
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const updateStatus = (userId: string, status: "online" | "offline") => {
    const statuses = JSON.parse(localStorage.getItem("operator_statuses") || "{}");
    statuses[userId] = { status, lastSeen: Date.now() };
    localStorage.setItem("operator_statuses", JSON.stringify(statuses));
  };

  const login = (email: string, password: string) => {
    let auth: User | null = null;
    
    // Check for dynamic admin credentials
    const savedAdminEmail = localStorage.getItem("admin_email") || "admin@sistema.com";
    const savedAdminPass = localStorage.getItem("admin_password") || "admin123";

    if (email === savedAdminEmail && password === savedAdminPass) {
      auth = { id: "admin-1", email, role: "admin", name: "Admin Global" };
    } else if (email === "operador@sistema.com" && password === "op123") {
      auth = { id: "op-1", email, role: "operator", name: "Operador Padrão" };
    }

    if (auth) {
      setUser(auth);
      localStorage.setItem("auth_user", JSON.stringify(auth));
      updateStatus(auth.id, "online");
      navigate({ to: "/" });
      return true;
    }
    return false;
  };

  const logout = () => {
    if (user) updateStatus(user.id, "offline");
    setUser(null);
    localStorage.removeItem("auth_user");
    navigate({ to: "/login" });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

