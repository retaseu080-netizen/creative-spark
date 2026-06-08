import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Receipt, TrendingUp, Users, Calendar } from "lucide-react";
import { cn } from "../../lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  icon: any;
  description: string;
  color?: string;
}

function MetricCard({ title, value, icon: Icon, description, color }: MetricCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={cn("p-2 rounded-full", color || "bg-slate-100")}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}

interface DashboardMetricsProps {
  clients: any[];
}

export function DashboardMetrics({ clients }: DashboardMetricsProps) {
  const [period, setPeriod] = useState<"day" | "month" | "year">("month");

  const stats = useMemo(() => {
    const pending = clients
      .filter(c => c.status === "Pendente")
      .reduce((acc, curr) => acc + parseFloat(curr.value.replace("R$ ", "").replace(".", "").replace(",", ".")), 0);
    
    const profit = clients
      .filter(c => c.status === "Pago")
      .reduce((acc, curr) => acc + parseFloat(curr.value.replace("R$ ", "").replace(".", "").replace(",", ".")), 0);
    
    const active = clients.length;

    // Simulação de filtros de período (em um app real, filtraria as datas)
    const multiplier = period === "day" ? 0.05 : period === "year" ? 12 : 1;
    
    return {
      pending: (pending * multiplier).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      profit: (profit * multiplier).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      active: Math.floor(active * multiplier)
    };
  }, [clients, period]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 bg-white p-1 rounded-lg border w-fit shadow-sm">
        <Button 
          variant={period === "day" ? "default" : "ghost"} 
          size="sm" 
          onClick={() => setPeriod("day")}
          className="h-8"
        >
          Dia
        </Button>
        <Button 
          variant={period === "month" ? "default" : "ghost"} 
          size="sm" 
          onClick={() => setPeriod("month")}
          className="h-8"
        >
          Mês
        </Button>
        <Button 
          variant={period === "year" ? "default" : "ghost"} 
          size="sm" 
          onClick={() => setPeriod("year")}
          className="h-8"
        >
          Ano
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard 
          title="Pendentes" 
          value={stats.pending} 
          icon={Receipt} 
          description="Valor total aguardando" 
          color="bg-amber-100 text-amber-600"
        />
        <MetricCard 
          title="Lucro" 
          value={stats.profit} 
          icon={TrendingUp} 
          description="Total pago acumulado" 
          color="bg-green-100 text-green-600"
        />
        <MetricCard 
          title="Clientes Ativos" 
          value={stats.active.toString()} 
          icon={Users} 
          description="Total de cadastros" 
          color="bg-blue-100 text-blue-600"
        />
      </div>
    </div>
  );
}
