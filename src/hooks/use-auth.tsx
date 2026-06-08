import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";

export type Role = "admin" | "operator";

export interface User {
  email: string;
  role: Role;
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
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const login = (email: string, password: string) => {
    // Credencial padrão: admin@sistema.com / admin123
    if (email === "admin@sistema.com" && password === "admin123") {
      const auth = { email, role: "admin" as Role };
      setUser(auth);
      localStorage.setItem("auth_user", JSON.stringify(auth));
      navigate({ to: "/" });
      return true;
    }
    // Operador demo: operador@sistema.com / op123
    if (email === "operador@sistema.com" && password === "op123") {
        const auth = { email, role: "operator" as Role };
        setUser(auth);
        localStorage.setItem("auth_user", JSON.stringify(auth));
        navigate({ to: "/" });
        return true;
    }
    return false;
  };

  const logout = () => {
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
