import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "../components/layout/dashboard-layout";
import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../components/ui/table";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { useWebhook } from "../hooks/use-webhook";
import { toast } from "sonner";
import { CheckCircle2, Clock } from "lucide-react";

export const Route = createFileRoute("/clientes")({
  component: ClientsComponent,
});

interface Client {
  id: string;
  name: string;
  email: string;
  status: "Pendente" | "Pago";
  value: string;
}

const initialClients: Client[] = [
  { id: "1", name: "João Silva", email: "joao@exemplo.com", status: "Pendente", value: "R$ 450,00" },
  { id: "2", name: "Maria Oliveira", email: "maria@exemplo.com", status: "Pago", value: "R$ 1.200,00" },
  { id: "3", name: "Pedro Santos", email: "pedro@exemplo.com", status: "Pendente", value: "R$ 890,00" },
];

function ClientsComponent() {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const { notifyPayment } = useWebhook();

  const handleManualPayment = async (clientId: string) => {
    // 5. Automação de Alerta: Evento "Pago Manual"
    setClients(prev => prev.map(c => 
      c.id === clientId ? { ...c, status: "Pago" } : c
    ));

    toast.success("Cobrança alterada para Pago.");

    // Gatilho Automático: Imediatamente após a alteração do status para pago, o sistema deve disparar uma requisição
    await notifyPayment(clientId);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Clientes</h1>
            <p className="text-slate-500">Gerencie a lista de clientes e cobranças.</p>
          </div>
        </div>

        <div className="rounded-md border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>{client.value}</TableCell>
                  <TableCell>
                    {client.status === "Pago" ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 flex w-fit items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Pago
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 flex w-fit items-center gap-1">
                        <Clock className="h-3 w-3" /> Pendente
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {client.status === "Pendente" && (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-primary hover:text-primary hover:bg-primary/10"
                        onClick={() => handleManualPayment(client.id)}
                      >
                        Pago Manual
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
}
