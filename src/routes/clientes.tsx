import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "../components/layout/dashboard-layout";
import { useState, useEffect } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../components/ui/table";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import {
  CheckCircle2, Clock, UserPlus, Edit, Trash2, CalendarCheck,
  MessageCircle, AlertCircle, BellRing, AlertTriangle, KeyRound, ThumbsUp,
} from "lucide-react";
import { format, addMonths } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import {
  useEvolutionConfig, evolutionSendText, sleep,
} from "../hooks/use-evolution";

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

interface ResaleSettings {
  pix_key: string | null;
  beneficiary_name: string | null;
  resale_name: string | null;
}

type ActionType = "lembrete" | "alerta" | "pix" | "obrigado";

function ClientsComponent() {
  const { config } = useEvolutionConfig();
  const [clients, setClients] = useState<Client[]>([]);
  const [settings, setSettings] = useState<ResaleSettings>({ pix_key: null, beneficiary_name: null, resale_name: null });
  const [loading, setLoading] = useState(true);

  const [isOpen, setIsOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [nextDueDate, setNextDueDate] = useState("");
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const [rowAction, setRowAction] = useState<Record<string, ActionType | null>>({});

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [value, setValue] = useState("");

  const fetchAll = async () => {
    setLoading(true);
    const [{ data: cdata, error: cerr }, { data: sdata }] = await Promise.all([
      supabase.from("clients").select("*").order("name"),
      supabase.from("resale_settings").select("pix_key,beneficiary_name,resale_name").maybeSingle(),
    ]);
    if (cerr) toast.error("Erro ao carregar clientes: " + cerr.message);
    else setClients(cdata as unknown as Client[]);
    if (sdata) setSettings(sdata as ResaleSettings);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  useEffect(() => {
    if (editingClient) {
      setName(editingClient.name);
      setEmail(editingClient.email || "");
      setPhone(editingClient.phone);
      setValue(editingClient.value);
    } else {
      setName(""); setEmail(""); setPhone(""); setValue("");
    }
  }, [editingClient]);

  const ensureConfigured = () => {
    if (!config.url || !config.apikey || !config.instance) {
      toast.error("Configure a Evolution API em Conexão WhatsApp.");
      return false;
    }
    return true;
  };

  const buildMessage = (type: ActionType, client: Client) => {
    const valor = Number(client.value || "0").toFixed(2).replace(".", ",");
    const venc = client.due_date ? format(new Date(client.due_date), "dd/MM/yyyy") : "—";
    const revenda = settings.resale_name || "sua revenda";
    switch (type) {
      case "lembrete":
        return `Olá, *${client.name}*! ☀️\n\nLembrete amigável: o seu plano vence em *${venc}*.\n💳 Valor: *R$ ${valor}*\n\nQuando quiser, me responda aqui que envio a chave Pix para pagamento. 🙏\n— ${revenda}`;
      case "alerta":
        return `Olá, *${client.name}*. ⚠️\n\nIdentificamos que o seu pagamento está em atraso (vencimento ${venc}).\nPara evitar a suspensão do serviço, regularize o quanto antes.\n💳 Valor: *R$ ${valor}*\n\nMe avise aqui que envio a chave Pix em seguida.\n— ${revenda}`;
      case "pix":
        return `Olá, *${client.name}*! Segue a chave Pix para pagamento da sua assinatura.\n\n👤 Beneficiário: *${settings.beneficiary_name || "—"}*\n💳 Valor: *R$ ${valor}*\n\nA chave Pix vai na próxima mensagem (para facilitar o copia e cola) 👇`;
      case "obrigado":
        return `Obrigado, *${client.name}*! 🙌\nSeu pagamento foi confirmado com sucesso.\n${client.due_date ? `Próximo vencimento: *${format(new Date(client.due_date), "dd/MM/yyyy")}*.` : ""}\n\nQualquer coisa, é só chamar. 💚\n— ${revenda}`;
    }
  };

  const runAction = async (client: Client, type: ActionType) => {
    if (!ensureConfigured()) return;
    setRowAction(prev => ({ ...prev, [client.id]: type }));
    try {
      if (type === "pix") {
        if (!settings.pix_key) {
          toast.error("Cadastre a chave Pix em Configurações.");
          return;
        }
        const aviso = buildMessage("pix", client);
        const r1 = await evolutionSendText(config, client.phone, aviso, 1000);
        if (!r1.success) { toast.error("Falha ao enviar aviso Pix."); return; }
        await sleep(2000);
        const r2 = await evolutionSendText(config, client.phone, settings.pix_key, 500);
        if (!r2.success) { toast.error("Falha ao enviar chave Pix."); return; }
        toast.success(`Pix enviado para ${client.name}.`);
      } else {
        const msg = buildMessage(type, client);
        const r = await evolutionSendText(config, client.phone, msg, 1200);
        if (!r.success) { toast.error("Falha ao enviar mensagem."); return; }
        const label = type === "lembrete" ? "Lembrete" : type === "alerta" ? "Alerta" : "Mensagem";
        toast.success(`${label} enviado para ${client.name}.`);
      }
    } catch (e: any) {
      toast.error("Erro ao enviar: " + (e?.message || "desconhecido"));
    } finally {
      setRowAction(prev => ({ ...prev, [client.id]: null }));
    }
  };

  const openPaymentModal = (client: Client) => {
    setSelectedClient(client);
    setNextDueDate(format(addMonths(new Date(), 1), "yyyy-MM-dd"));
    setIsPaymentModalOpen(true);
  };

  const handleConfirmPayment = async () => {
    if (!selectedClient) return;
    const { error } = await supabase
      .from("clients")
      .update({ status: "pago", due_date: nextDueDate })
      .eq("id", selectedClient.id);

    if (error) { toast.error("Erro: " + error.message); return; }
    toast.success("Pagamento confirmado.");

    // Dispara mensagem automática de agradecimento
    const updatedClient = { ...selectedClient, due_date: nextDueDate, status: "pago" as const };
    if (config.url && config.apikey && config.instance) {
      const msg = buildMessage("obrigado", updatedClient);
      const r = await evolutionSendText(config, updatedClient.phone, msg, 1200);
      if (r.success) toast.success("Mensagem de agradecimento enviada.");
      else toast.error("Pagamento salvo, mas falhou ao enviar mensagem.");
    } else {
      toast.info("Configure a Evolution API para enviar agradecimento automático.");
    }

    setIsPaymentModalOpen(false);
    setSelectedClient(null);
    fetchAll();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClient) {
      const { error } = await supabase.from("clients").update({ name, email, phone, value }).eq("id", editingClient.id);
      if (error) toast.error("Erro: " + error.message);
      else { toast.success("Cliente atualizado!"); fetchAll(); }
    } else {
      const { error } = await supabase.from("clients").insert([{ name, email, phone, value, status: "pendente" }]);
      if (error) toast.error("Erro: " + error.message);
      else { toast.success("Cliente adicionado!"); fetchAll(); }
    }
    setIsOpen(false);
    setEditingClient(null);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("clients").delete().eq("id", id);
    if (error) toast.error("Erro: " + error.message);
    else { toast.success("Cliente removido."); fetchAll(); }
  };

  const openWhatsApp = (phoneNumber: string) => {
    const clean = phoneNumber.replace(/\D/g, "");
    window.open(`https://wa.me/${clean}`, "_blank");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Clientes</h1>
            <p className="text-sm text-slate-500">Gerencie cobranças e dispare mensagens.</p>
          </div>

          <Dialog open={isOpen} onOpenChange={(v) => { setIsOpen(v); if (!v) setEditingClient(null); }}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto flex items-center gap-2">
                <UserPlus className="h-4 w-4" /> Adicionar Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingClient ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
                <DialogDescription>Preencha os dados da cobrança.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <div className="space-y-2"><Label htmlFor="c-name">Nome</Label><Input id="c-name" required value={name} onChange={e => setName(e.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="c-email">E-mail</Label><Input id="c-email" type="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="c-phone">Telefone (WhatsApp)</Label><Input id="c-phone" required placeholder="5511999999999" value={phone} onChange={e => setPhone(e.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="c-value">Valor (ex: 150.00)</Label><Input id="c-value" required value={value} onChange={e => setValue(e.target.value)} /></div>
                <DialogFooter className="pt-2">
                  <Button type="submit" className="w-full">{editingClient ? "Salvar Alterações" : "Adicionar Cliente"}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><CalendarCheck className="h-5 w-5 text-primary" />Confirmar Pagamento</DialogTitle>
              <DialogDescription>Informe a próxima data de vencimento. Uma mensagem de agradecimento será enviada automaticamente.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="next-date">Próxima Data de Vencimento</Label>
                <Input id="next-date" type="date" value={nextDueDate} onChange={e => setNextDueDate(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPaymentModalOpen(false)}>Cancelar</Button>
              <Button onClick={handleConfirmPayment}>Confirmar e Agradecer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* MOBILE: cards. DESKTOP: table */}
        <div className="space-y-3 md:hidden">
          {loading ? (
            <div className="text-center py-8 text-sm text-slate-500">Carregando...</div>
          ) : clients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              busy={rowAction[client.id] ?? null}
              onAction={(t) => runAction(client, t)}
              onConfirm={() => openPaymentModal(client)}
              onWhats={() => openWhatsApp(client.phone)}
              onEdit={() => { setEditingClient(client); setIsOpen(true); }}
              onDelete={() => handleDelete(client.id)}
            />
          ))}
        </div>

        <div className="hidden md:block rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
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
                <TableRow><TableCell colSpan={5} className="text-center py-8">Carregando...</TableCell></TableRow>
              ) : clients.map((client) => (
                <TableRow key={client.id} className="dark:border-slate-800">
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>{client.phone}</TableCell>
                  <TableCell>R$ {client.value}</TableCell>
                  <TableCell><StatusBadge status={client.status} dueDate={client.due_date} /></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end flex-wrap gap-1">
                      <ActionButtons
                        busy={rowAction[client.id] ?? null}
                        onAction={(t) => runAction(client, t)}
                        onConfirm={() => openPaymentModal(client)}
                      />
                      <Button size="sm" variant="ghost" className="h-8 px-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20" onClick={() => openWhatsApp(client.phone)}>
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingClient(client); setIsOpen(true); }}>
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

function StatusBadge({ status, dueDate }: { status: Client["status"]; dueDate: string | null }) {
  if (status === "pago") {
    return (
      <div className="space-y-1">
        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-100 flex w-fit items-center gap-1 border-green-200">
          <CheckCircle2 className="h-3 w-3" /> Pago
        </Badge>
        {dueDate && <div className="text-[10px] text-muted-foreground px-1">Prox: {format(new Date(dueDate), "dd/MM/yyyy")}</div>}
      </div>
    );
  }
  if (status === "atrasado") {
    return <Badge variant="destructive" className="flex w-fit items-center gap-1"><AlertCircle className="h-3 w-3" />Atrasado</Badge>;
  }
  return <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-900/50 dark:text-orange-400 flex w-fit items-center gap-1"><Clock className="h-3 w-3" />Pendente</Badge>;
}

function ActionButtons({
  busy, onAction, onConfirm,
}: { busy: ActionType | null; onAction: (t: ActionType) => void; onConfirm: () => void }) {
  return (
    <>
      <Button size="sm" variant="outline" disabled={!!busy}
        className="h-8 px-2 text-[11px] font-semibold border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
        onClick={() => onAction("lembrete")}>
        <BellRing className="h-3.5 w-3.5 mr-1" />Lembrete
      </Button>
      <Button size="sm" variant="outline" disabled={!!busy}
        className="h-8 px-2 text-[11px] font-semibold border-orange-500 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20"
        onClick={() => onAction("alerta")}>
        <AlertTriangle className="h-3.5 w-3.5 mr-1" />Alerta
      </Button>
      <Button size="sm" variant="outline" disabled={!!busy}
        className="h-8 px-2 text-[11px] font-semibold border-purple-500 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
        onClick={() => onAction("pix")}>
        <KeyRound className="h-3.5 w-3.5 mr-1" />Pix
      </Button>
      <Button size="sm" disabled={!!busy}
        className="h-8 px-2 text-[11px] font-semibold bg-green-600 hover:bg-green-700"
        onClick={onConfirm}>
        <ThumbsUp className="h-3.5 w-3.5 mr-1" />Confirmar
      </Button>
    </>
  );
}

function ClientCard({
  client, busy, onAction, onConfirm, onWhats, onEdit, onDelete,
}: {
  client: Client;
  busy: ActionType | null;
  onAction: (t: ActionType) => void;
  onConfirm: () => void;
  onWhats: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-slate-900 dark:text-white truncate">{client.name}</p>
          <p className="text-xs text-slate-500">{client.phone}</p>
        </div>
        <StatusBadge status={client.status} dueDate={client.due_date} />
      </div>
      <div className="text-sm text-slate-700 dark:text-slate-300">
        Valor: <span className="font-semibold">R$ {client.value}</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <ActionButtons busy={busy} onAction={onAction} onConfirm={onConfirm} />
      </div>
      <div className="flex items-center justify-end gap-1 pt-1 border-t border-slate-100 dark:border-slate-800">
        <Button size="sm" variant="ghost" className="h-8 px-2 text-green-600" onClick={onWhats}><MessageCircle className="h-4 w-4" /></Button>
        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={onEdit}><Edit className="h-4 w-4 text-slate-400" /></Button>
        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={onDelete}><Trash2 className="h-4 w-4 text-red-400" /></Button>
      </div>
    </div>
  );
}
