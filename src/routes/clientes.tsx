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
import { CheckCircle2, Clock, UserPlus, Edit, Trash2, CalendarCheck, MessageCircle } from "lucide-react";
import { format, addMonths } from "date-fns";

export const Route = createFileRoute("/clientes")({
  component: ClientsComponent,
});

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: "Pendente" | "Pago";
  value: string;
  dueDate?: string;
}

const initialClients: Client[] = [
  { id: "1", name: "João Silva", email: "joao@exemplo.com", phone: "5511999999999", status: "Pendente", value: "R$ 450,00" },
  { id: "2", name: "Maria Oliveira", email: "maria@exemplo.com", phone: "5511988888888", status: "Pago", value: "R$ 1.200,00" },
  { id: "3", name: "Pedro Santos", email: "pedro@exemplo.com", phone: "5511977777777", status: "Pendente", value: "R$ 890,00" },
];

function ClientsComponent() {
  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem("app_clients");
    return saved ? JSON.parse(saved) : initialClients;
  });
  const [isOpen, setIsOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [nextDueDate, setNextDueDate] = useState("");
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const { notifyPayment } = useWebhook();

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [value, setValue] = useState("");

  useEffect(() => {
    localStorage.setItem("app_clients", JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    if (editingClient) {
      setName(editingClient.name);
      setEmail(editingClient.email);
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
    setNextDueDate(format(nextDate, "dd/MM/yyyy"));
    setIsPaymentModalOpen(true);
  };

  const handleConfirmPayment = async () => {
    if (!selectedClientId) return;

    setClients(prev => prev.map(c => 
      c.id === selectedClientId ? { ...c, status: "Pago", dueDate: nextDueDate } : c
    ));

    toast.success(`Cobrança alterada para Pago. Próximo vencimento: ${nextDueDate}`);
    await notifyPayment(selectedClientId, nextDueDate);
    setIsPaymentModalOpen(false);
    setSelectedClientId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClient) {
      setClients(clients.map(c => c.id === editingClient.id ? { ...c, name, email, phone, value } : c));
      toast.success("Cliente atualizado!");
    } else {
      const numValue = parseFloat(value.replace(",", "."));
      const newClient: Client = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        email,
        phone,
        value: isNaN(numValue) ? value : `R$ ${numValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        status: "Pendente"
      };
      setClients([...clients, newClient]);
      toast.success("Cliente adicionado!");
    }
    setIsOpen(false);
    setEditingClient(null);
  };

  const handleDelete = (id: string) => {
    setClients(clients.filter(c => c.id !== id));
    toast.success("Cliente removido.");
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
                  <Input id="c-email" type="email" required value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="c-phone">Telefone (WhatsApp)</Label>
                  <Input id="c-phone" required placeholder="5511999999999" value={phone} onChange={e => setPhone(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="c-value">Valor da Cobrança (ex: 150.00)</Label>
                  <Input id="c-value" required value={value.replace("R$ ", "")} onChange={e => setValue(e.target.value)} />
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
                  value={nextDueDate} 
                  onChange={e => setNextDueDate(e.target.value)}
                  placeholder="dd/mm/aaaa"
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
                <TableHead>E-mail</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id} className="dark:border-slate-800">
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>{client.phone}</TableCell>
                  <TableCell>{client.value}</TableCell>
                  <TableCell>
                    {client.status === "Pago" ? (
                      <div className="space-y-1">
                        <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-100 flex w-fit items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Pago
                        </Badge>
                        {client.dueDate && (
                          <div className="text-[10px] text-muted-foreground px-1">
                            Prox: {client.dueDate}
                          </div>
                        )}
                      </div>
                    ) : (
                      <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-900/50 dark:text-amber-400 flex w-fit items-center gap-1">
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
                      {client.status === "Pendente" && (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-primary hover:text-primary hover:bg-primary/10 h-8 px-2"
                          onClick={() => openPaymentModal(client.id)}
                        >
                          Pago Manual
                        </Button>
                      )}
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

