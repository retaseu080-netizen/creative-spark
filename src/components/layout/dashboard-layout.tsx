import { ReactNode, useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { useAuth } from "../../hooks/use-auth";
import { cn } from "../../lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  UserSquare2, 
  LogOut,
  Menu,
  X,
  MessageSquare,
  MessageCircleQuestion,
  Lock,
  Smartphone
} from "lucide-react";
import { Button } from "../ui/button";
import { ThemeToggle } from "../theme-toggle";

interface SidebarProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: SidebarProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Simulação de status de bloqueio do operador
  const isBlocked = typeof window !== 'undefined' && localStorage.getItem("is_operator_blocked") === "true" && user?.role === "operator";

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
      roles: ["admin", "operator"],
    },
  ];

  const filteredItems = menuItems.filter(item => 
    item.roles.includes(user?.role || "")
  );

  const handleSupport = () => {
    const rawNumber = localStorage.getItem("support_number") || "5511999999999";
    const cleanNumber = rawNumber.replace(/\D/g, "");
    const text = isBlocked 
      ? "Olá, meu acesso foi restrito e preciso de liberação." 
      : "Olá, preciso de suporte no sistema.";
    window.open(`https://wa.me/${cleanNumber.startsWith("55") ? cleanNumber : "55" + cleanNumber}?text=${encodeURIComponent(text)}`, "_blank");
  };

  if (isBlocked) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 transition-colors duration-300">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-red-100 dark:bg-red-900/30">
              <Lock className="h-12 w-12 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Acesso Restrito</h1>
            <p className="text-slate-500 dark:text-slate-400">
              Seu acesso ao painel foi bloqueado por um administrador. Por favor, entre em contato para solicitar a liberação.
            </p>
          </div>
          <Button 
            onClick={handleSupport} 
            className="w-full h-12 text-lg font-semibold flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700"
          >
            <MessageCircleQuestion className="h-5 w-5" />
            Chamar Suporte / Falar com Admin
          </Button>
          <Button variant="ghost" onClick={logout} className="text-slate-500">
            Sair do Sistema
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background transition-colors duration-300">
      {/* Botão de Menu Flutuante (Hambúrguer) e Suporte */}
      <div className="fixed top-4 left-4 z-50 flex items-center gap-2">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="rounded-full shadow-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
        >
          {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleSupport}
          className="hidden md:flex items-center gap-2 rounded-full shadow-sm bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
        >
          <MessageCircleQuestion className="h-4 w-4" />
          Suporte
        </Button>
      </div>

      {/* Overlay para fechar ao clicar fora */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 dark:bg-black/40 z-30 backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Oculta por Padrão */}
      <aside className={cn(
        "fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-card transition-transform duration-300 ease-in-out",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col px-3 py-4">
          <div className="flex items-center justify-between mb-10 px-2 mt-2">
            <div className="text-2xl font-bold text-primary">CobrançaSys</div>
            <ThemeToggle />
          </div>
          
          <nav className="flex-1 space-y-1">
            {filteredItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setIsSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-800",
                  location.pathname === item.to 
                    ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                    : "text-slate-600 dark:text-slate-400"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            ))}
            
            <button
              onClick={handleSupport}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
            >
              <MessageCircleQuestion className="h-4 w-4" />
              Suporte
            </button>
          </nav>

          <div className="mt-auto border-t border-slate-200 dark:border-slate-800 pt-4">
            <div className="mb-4 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {user?.role === "admin" ? "Administrador" : "Operador"}
            </div>
            <div className="flex items-center justify-between px-3">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400 truncate max-w-[120px]">
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
      <main className="flex-1 w-full min-h-screen pt-16">
        <div className="container mx-auto p-4 md:p-8 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}
