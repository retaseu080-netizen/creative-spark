import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "../components/layout/dashboard-layout";
// CategorySection removed
import { DashboardMetrics } from "../components/dashboard/dashboard-metrics";
import { BillingSimulator } from "../components/dashboard/billing-simulator";
import { ClientStatusChart } from "../components/dashboard/client-status-chart";
import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { parse, isBefore, addDays, differenceInDays, isToday } from "date-fns";
import { AlertCircle, Clock } from "lucide-react";
import { useWebhook } from "../hooks/use-webhook";

export const Route = createFileRoute("/")({
  component: DashboardComponent,
});

interface Client {
  id: string;
  name: string;
  email: string;
  status: "Pendente" | "Pago";
  value: string;
  dueDate?: string;
  lastAutoTrigger?: string; // Para evitar disparos duplicados no mesmo dia
}

function DashboardComponent() {
  const [clients, setClients] = useState<Client[]>([]);
  const { notifyStatusChange } = useWebhook();

  useEffect(() => {
    const updateClients = () => {
      const saved = localStorage.getItem("app_clients");
      if (saved) {
        const parsedClients: Client[] = JSON.parse(saved);
        const today = new Date();
        let hasChanges = false;

        const updatedClients = parsedClients.map(client => {
          if (client.dueDate) {
            const dueDate = parse(client.dueDate, "dd/MM/yyyy", new Date());
            const daysToDue = differenceInDays(dueDate, today);
            const daysOverdue = differenceInDays(today, dueDate);

            // 1. Alerta Antecipado (Exatamente 3 Dias Antes)
            if (daysToDue === 3 && client.status === "Pago" && client.lastAutoTrigger !== `pending_3d_${client.id}_${today.toDateString()}`) {
              notifyStatusChange(client.id, "PENDING", "3 dias");
              hasChanges = true;
              return { ...client, status: "Pendente" as const, lastAutoTrigger: `pending_3d_${client.id}_${today.toDateString()}` };
            }

            // 2. Cobrança de Atraso (Exatamente 5 Dias Depois)
            if (daysOverdue === 5 && client.status === "Pendente" && client.lastAutoTrigger !== `overdue_5d_${client.id}_${today.toDateString()}`) {
               notifyStatusChange(client.id, "OVERDUE_ALERT", "5 dias");
               hasChanges = true;
               return { ...client, lastAutoTrigger: `overdue_5d_${client.id}_${today.toDateString()}` };
            }
          }
          return client;
        });

        if (hasChanges) {
            localStorage.setItem("app_clients", JSON.stringify(updatedClients));
        }
        setClients(updatedClients);
      }
    };


    updateClients();
    const interval = setInterval(updateClients, 60000); // Check every minute
    
    const handleStorage = () => updateClients();
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, []);

  const overdueClients = useMemo(() => {
    const today = new Date();
    return clients.filter(c => {
      if (c.status === "Pago" || !c.dueDate) return false;
      const dueDate = parse(c.dueDate, "dd/MM/yyyy", new Date());
      return isBefore(dueDate, today) && differenceInDays(today, dueDate) > 0;
    });
  }, [clients]);

  const urgentClients = useMemo(() => {
    const today = new Date();
    return clients.filter(c => {
      if (c.status === "Pago" || !c.dueDate) return false;
      const dueDate = parse(c.dueDate, "dd/MM/yyyy", new Date());
      const daysToDue = differenceInDays(dueDate, today);
      return daysToDue >= 0 && daysToDue <= 3;
    });
  }, [clients]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Dashboard</h1>
          <p className="text-slate-500">Monitoramento e métricas em tempo real.</p>
        </div>

        <DashboardMetrics clients={clients} />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <BillingSimulator />
            
            <div className="grid gap-6 md:grid-cols-2">
              {/* Alertas de Vencidos */}
              <Card className="border-red-100 dark:border-red-900/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold flex items-center gap-2 text-red-600">
                    <AlertCircle className="h-4 w-4" /> Clientes Vencidos
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-0">
                  <div className="max-h-[200px] overflow-y-auto px-6">
                    {overdueClients.length > 0 ? (
                      <Table>
                        <TableBody>
                          {overdueClients.map(c => (
                            <TableRow key={c.id} className="border-none hover:bg-slate-50 dark:hover:bg-slate-800/50">
                              <TableCell className="py-2 pl-0 font-medium text-xs text-red-600">{c.name}</TableCell>
                              <TableCell className="py-2 text-right pr-0">
                                <Badge variant="destructive" className="text-[10px] h-5 bg-red-600">{c.dueDate}</Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="text-xs text-muted-foreground text-center py-4">Nenhuma fatura vencida.</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Alertas de Pendentes (Próximos 3 dias) */}
              <Card className="border-orange-100 dark:border-orange-900/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold flex items-center gap-2 text-orange-600">
                    <Clock className="h-4 w-4" /> Vencimento Próximo
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-0">
                  <div className="max-h-[200px] overflow-y-auto px-6">
                    {urgentClients.length > 0 ? (
                      <Table>
                        <TableBody>
                          {urgentClients.map(c => (
                            <TableRow key={c.id} className="border-none hover:bg-slate-50 dark:hover:bg-slate-800/50">
                              <TableCell className="py-2 pl-0 font-medium text-xs">{c.name}</TableCell>
                              <TableCell className="py-2 text-right pr-0">
                                <Badge variant="outline" className="text-[10px] h-5 border-orange-200 text-orange-600">{c.dueDate}</Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="text-xs text-muted-foreground text-center py-4">Sem vencimentos próximos.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="space-y-6">
            <ClientStatusChart clients={clients} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}



