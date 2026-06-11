import { createFileRoute } from "@tanstack/react-router";
import LandingPage from "./landing";
import { useAuth } from "../hooks/use-auth";
import { DashboardLayout } from "../components/layout/dashboard-layout";
import { DashboardMetrics } from "../components/dashboard/dashboard-metrics";
import { ClientStatusChart } from "../components/dashboard/client-status-chart";
import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Table, TableBody, TableCell, TableRow } from "../components/ui/table";
import { parseISO, isBefore, differenceInDays, format } from "date-fns";
import { AlertCircle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

interface Client {
  id: string;
  name: string;
  email: string | null;
  status: "pago" | "pendente" | "atrasado";
  value: string;
  due_date: string | null;
}

function HomeComponent() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  return <DashboardComponent />;
}

function DashboardComponent() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClients = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('clients')
      .select('*');
    
    if (!error && data) {
      setClients(data as unknown as Client[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const overdueClients = useMemo(() => {
    const today = new Date();
    return clients.filter(c => {
      if (c.status === "pago" || !c.due_date) return false;
      const dueDate = parseISO(c.due_date);
      return isBefore(dueDate, today) && differenceInDays(today, dueDate) > 0;
    });
  }, [clients]);

  const urgentClients = useMemo(() => {
    const today = new Date();
    return clients.filter(c => {
      if (c.status === "pago" || !c.due_date) return false;
      const dueDate = parseISO(c.due_date);
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
            <div className="grid gap-6 md:grid-cols-2">
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
                                <Badge variant="destructive" className="text-[10px] h-5 bg-red-600">
                                  {c.due_date ? format(parseISO(c.due_date), 'dd/MM/yyyy') : '-'}
                                </Badge>
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
                                <Badge variant="outline" className="text-[10px] h-5 border-orange-200 text-orange-600">
                                  {c.due_date ? format(parseISO(c.due_date), 'dd/MM/yyyy') : '-'}
                                </Badge>
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
