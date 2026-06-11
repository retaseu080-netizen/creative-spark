import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";

export type Role = "admin" | "operator";

export interface User {
  id: string;
  email: string;
  role: Role;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check active sessions and sets the user
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || "",
          role: (session.user.user_metadata?.role as Role) || "admin",
          name: session.user.user_metadata?.name || "Usuário",
        });
      }
      setLoading(false);
    };

    getSession();

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || "",
          role: (session.user.user_metadata?.role as Role) || "admin",
          name: session.user.user_metadata?.name || "Usuário",
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return false;

    if (data.user) {
      setUser({
        id: data.user.id,
        email: data.user.email || "",
        role: (data.user.user_metadata?.role as Role) || "admin",
        name: data.user.user_metadata?.name || "Usuário",
      });
      navigate({ to: "/" });
      return true;
    }
    return false;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate({ to: "/login" });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

