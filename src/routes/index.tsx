import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "../components/layout/dashboard-layout";
import { CategorySection } from "../components/dashboard/category-section";
import { DashboardMetrics } from "../components/dashboard/dashboard-metrics";
import { BillingSimulator } from "../components/dashboard/billing-simulator";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/")({
  component: DashboardComponent,
});

interface Client {
  id: string;
  name: string;
  email: string;
  status: "Pendente" | "Pago";
  value: string;
}

function DashboardComponent() {
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("app_clients");
    if (saved) setClients(JSON.parse(saved));
    
    // Listen for storage changes to update in real-time if multiple tabs are open
    const handleStorage = () => {
      const updated = localStorage.getItem("app_clients");
      if (updated) setClients(JSON.parse(updated));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Dashboard</h1>
          <p className="text-slate-500">Bem-vindo ao seu painel de gerenciamento.</p>
        </div>

        {/* 1. Cards de Métricas em Tempo Real */}
        <DashboardMetrics clients={clients} />

        <div className="grid gap-6 md:grid-cols-1">
          {/* 2. Área de Simulação */}
          <BillingSimulator />
          
          {/* Sistema de Categorias Ocultas */}
          <CategorySection />
        </div>
      </div>
    </DashboardLayout>
  );
}


