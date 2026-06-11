import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "../components/layout/dashboard-layout";
import { useState, useEffect } from "react";
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
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useWebhook } from "../hooks/use-webhook";
import { toast } from "sonner";
import { CheckCircle2, Clock, UserPlus, Edit, Trash2, CalendarCheck, MessageCircle, AlertCircle, Loader2 } from "lucide-react";
import { format, addMonths } from "date-fns";
import { cn } from "../lib/utils";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/clientes")({
  component: ClientsComponent,
});

interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  resale_name: string | null;
  value: string;
  due_date: string | null;
  status: "pago" | "pendente" | "atrasado";
}

function ClientsComponent() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [nextDueDate, setNextDueDate] = useState("");
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  
  const [rowLoading, setRowLoading] = useState<Record<string, "manual" | "alert" | null>>({});
  const [rowStatus, setRowStatus] = useState<Record<string, "success" | "error" | null>>({});

  const { notifyPayment, genericRequest } = useWebhook();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [value, setValue] = useState("");

  const fetchClients = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('name');
    
    if (error) {
      toast.error("Erro ao carregar clientes: " + error.message);
    } else {
      setClients(data as unknown as Client[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (editingClient) {
      setName(editingClient.name);
      setEmail(editingClient.email || "");
      setPhone(editingClient.phone);
      setValue(editingClient.value);
    } else {
      setName("");
      setEmail("");
      setPhone("");
      setValue("");
    }
  }, [editingClient]);

  const openPaymentModal = (clientId: string) => {
    setSelectedClientId(clientId);
    const nextDate = addMonths(new Date(), 1);
    setNextDueDate(format(nextDate, "yyyy-MM-dd"));
    setIsPaymentModalOpen(true);
  };

  const handleConfirmPayment = async () => {
    if (!selectedClientId) return;

    const { error } = await supabase
      .from('clients')
      .update({ status: 'pago', due_date: nextDueDate })
      .eq('id', selectedClientId);

    if (error) {
      toast.error("Erro ao atualizar pagamento: " + error.message);
      return;
    }

    toast.success(`Cobrança alterada para Pago. Próximo vencimento: ${nextDueDate}`);
    await notifyPayment(selectedClientId, nextDueDate);
    setIsPaymentModalOpen(false);
    setSelectedClientId(null);
    fetchClients();
  };

  const handleManualPaymentAction = async (client: Client) => {
    setRowLoading(prev => ({ ...prev, [client.id]: "manual" }));
    
    const { error } = await supabase
      .from('clients')
      .update({ status: 'pago' })
      .eq('id', client.id);

    if (error) {
      setRowStatus(prev => ({ ...prev, [client.id]: "error" }));
      toast.error("Erro ao atualizar status: " + error.message);
    } else {
      const payload = {
        status: 'pago',
        cliente: client.name,
        telefone: client.phone,
        valor: client.value
      };
      await genericRequest(payload);
      setRowStatus(prev => ({ ...prev, [client.id]: "success" }));
      toast.success(`Pagamento de ${client.name} processado.`);
      fetchClients();
    }

    setRowLoading(prev => ({ ...prev, [client.id]: null }));
    setTimeout(() => setRowStatus(prev => ({ ...prev, [client.id]: null })), 3000);
  };

  const handleAlertAction = async (client: Client) => {
    setRowLoading(prev => ({ ...prev, [client.id]: "alert" }));

    const payload = {
      status: 'pendente',
      cliente: client.name,
      telefone: client.phone,
      valor: client.value,
      diasAtraso: -3
    };

    const result = await genericRequest(payload);

    if (result.success) {
      setRowStatus(prev => ({ ...prev, [client.id]: "success" }));
      toast.success(`Alerta de ${client.name} disparado.`);
    } else {
      setRowStatus(prev => ({ ...prev, [client.id]: "error" }));
      toast.error(`Erro ao disparar alerta: ${result.error}`);
    }

    setRowLoading(prev => ({ ...prev, [client.id]: null }));
    setTimeout(() => setRowStatus(prev => ({ ...prev, [client.id]: null })), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClient) {
      const { error } = await supabase
        .from('clients')
        .update({ name, email, phone, value })
        .eq('id', editingClient.id);
      
      if (error) toast.error("Erro ao atualizar: " + error.message);
      else {
        toast.success("Cliente atualizado!");
        fetchClients();
      }
    } else {
      const { error } = await supabase
        .from('clients')
        .insert([{ name, email, phone, value, status: 'pendente' }]);
      
      if (error) toast.error("Erro ao adicionar: " + error.message);
      else {
        toast.success("Cliente adicionado!");
        fetchClients();
      }
    }
    setIsOpen(false);
    setEditingClient(null);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (error) toast.error("Erro ao remover: " + error.message);
    else {
      toast.success("Cliente removido.");
      fetchClients();
    }
  };

  const handleWhatsAppCall = (phoneNumber: string) => {
    const cleanNumber = phoneNumber.replace(/\D/g, "");
    window.open(`https://wa.me/${cleanNumber}`, "_blank");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Clientes</h1>
            <p className="text-slate-500">Gerencie a lista de clientes e cobranças.</p>
          </div>

          <Dialog open={isOpen} onOpenChange={(val) => {
            setIsOpen(val);
            if (!val) setEditingClient(null);
          }}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" /> Adicionar Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingClient ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
                <DialogDescription>
                  Preencha os dados da cobrança.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="c-name">Nome</Label>
                  <Input id="c-name" required value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="c-email">E-mail</Label>
                  <Input id="c-email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="c-phone">Telefone (WhatsApp)</Label>
                  <Input id="c-phone" required placeholder="5511999999999" value={phone} onChange={e => setPhone(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="c-value">Valor da Cobrança (ex: 150.00)</Label>
                  <Input id="c-value" required value={value} onChange={e => setValue(e.target.value)} />
                </div>
                <DialogFooter className="pt-4">
                  <Button type="submit" className="w-full">
                    {editingClient ? "Salvar Alterações" : "Adicionar Cliente"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CalendarCheck className="h-5 w-5 text-primary" />
                Confirmar Pagamento
              </DialogTitle>
              <DialogDescription>
                Informe a próxima data de vencimento para este cliente.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="next-date">Próxima Data de Vencimento</Label>
                <Input 
                  id="next-date" 
                  type="date"
                  value={nextDueDate} 
                  onChange={e => setNextDueDate(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPaymentModalOpen(false)}>Cancelar</Button>
              <Button onClick={handleConfirmPayment}>Confirmar e Enviar Aviso</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                <TableHead>Nome</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">Carregando...</TableCell>
                </TableRow>
              ) : clients.map((client) => (
                <TableRow key={client.id} className="dark:border-slate-800">
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>{client.phone}</TableCell>
                  <TableCell>{client.value}</TableCell>
                  <TableCell>
                    {client.status === "pago" ? (
                      <div className="space-y-1">
                        <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-100 flex w-fit items-center gap-1 border-green-200">
                          <CheckCircle2 className="h-3 w-3" /> Pago
                        </Badge>
                        {client.due_date && (
                          <div className="text-[10px] text-muted-foreground px-1">
                            Prox: {format(new Date(client.due_date), 'dd/MM/yyyy')}
                          </div>
                        )}
                      </div>
                    ) : client.status === "atrasado" ? (
                      <Badge variant="destructive" className="flex w-fit items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> Atrasado
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-900/50 dark:text-orange-400 flex w-fit items-center gap-1">
                        <Clock className="h-3 w-3" /> Pendente
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 h-8 px-2"
                        onClick={() => handleWhatsAppCall(client.phone)}
                      >
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                      {client.status !== "pago" && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          disabled={!!rowLoading[client.id]}
                          className={cn(
                            "h-8 px-2 text-[11px] font-bold border-primary text-primary hover:bg-primary/10 transition-colors",
                            rowStatus[client.id] === "success" && "bg-green-500 text-white border-green-600 hover:bg-green-600",
                            rowStatus[client.id] === "error" && "bg-red-500 text-white border-red-600 hover:bg-red-600"
                          )}
                          onClick={() => handleManualPaymentAction(client)}
                        >
                          Pago Manual
                        </Button>
                      )}
                      
                      <Button 
                        size="sm" 
                        variant="outline"
                        disabled={!!rowLoading[client.id]}
                        className="h-8 px-2 text-[11px] font-bold border-orange-500 text-orange-600 hover:bg-orange-50 transition-colors"
                        onClick={() => handleAlertAction(client)}
                      >
                        Disparar Alerta
                      </Button>

                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                        setEditingClient(client);
                        setIsOpen(true);
                      }}>
                        <Edit className="h-4 w-4 text-slate-400" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(client.id)}>
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </Button>
                    </div>
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
