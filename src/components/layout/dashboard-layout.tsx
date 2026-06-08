import { ReactNode } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { useAuth } from "../../hooks/use-auth";
import { cn } from "../../lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  UserSquare2, 
  LogOut 
} from "lucide-react";
import { Button } from "../ui/button";

interface SidebarProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: SidebarProps) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      to: "/",
      roles: ["admin", "operator"],
    },
    {
      title: "Clientes",
      icon: Users,
      to: "/clientes",
      roles: ["admin", "operator"],
    },
    {
      title: "Gerenciar Equipe",
      icon: UserSquare2,
      to: "/usuarios",
      roles: ["admin"],
    },
    {
      title: "Configurações",
      icon: Settings,
      to: "/configuracoes",
      roles: ["admin", "operator"], // Configurações gerais (admin) + Motor (both)
    },
  ];

  const filteredItems = menuItems.filter(item => 
    item.roles.includes(user?.role || "")
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-white">
        <div className="flex h-full flex-col px-3 py-4">
          <div className="mb-10 px-2 text-2xl font-bold text-primary">CobrançaSys</div>
          
          <nav className="flex-1 space-y-1">
            {filteredItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-slate-100",
                  location.pathname === item.to 
                    ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                    : "text-slate-600"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            ))}
          </nav>

          <div className="mt-auto border-t pt-4">
            <div className="mb-4 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {user?.role === "admin" ? "Administrador" : "Operador"}
            </div>
            <div className="flex items-center justify-between px-3">
              <span className="text-sm font-medium text-slate-600 truncate max-w-[120px]">
                {user?.email}
              </span>
              <Button variant="ghost" size="icon" onClick={logout} className="text-slate-400 hover:text-red-500">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 pl-64">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
