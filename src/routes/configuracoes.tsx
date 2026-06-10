import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "../components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { useAuth } from "../hooks/use-auth";
import { useWebhook } from "../hooks/use-webhook";
import { toast } from "sonner";
import { useState } from "react";
import { MessageSquare, Settings2, Lock, UserCog, Database, Download, Upload } from "lucide-react";

export const Route = createFileRoute("/configuracoes")({
  component: SettingsComponent,
});

function SettingsComponent() {
  const { user, logout } = useAuth();
  const { url, saveUrl, testConnection } = useWebhook();
  
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [alertMsg, setAlertMsg] = useState(() => localStorage.getItem("msg_alert") || "Olá! Identificamos uma cobrança pendente em seu nome. Por favor, regularize clicando no link abaixo.");
  const [thanksMsg, setThanksMsg] = useState(() => localStorage.getItem("msg_thanks") || "Obrigado pelo pagamento! Seu próximo vencimento será em {nova_data_vencimento}");
  const [supportNumber, setSupportNumber] = useState(() => localStorage.getItem("support_number") || "(11) 99999-9999");

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      return numbers
        .replace(/^(\d{2})(\d)/g, "($1) $2")
        .replace(/(\d{5})(\d)/, "$1-$2")
        .substring(0, 15);
    }
    return value.substring(0, 15);
  };

  const handleSupportPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSupportNumber(formatPhone(e.target.value));
  };

  const handleSaveSettings = () => {
    localStorage.setItem("msg_alert", alertMsg);
    localStorage.setItem("msg_thanks", thanksMsg);
    localStorage.setItem("support_number", supportNumber);
    toast.success("Configurações salvas com sucesso!");
  };

  const handleUpdateCredentials = () => {
    if (!newAdminEmail || !newAdminPassword || !confirmPassword) {
      toast.error("Todos os campos de credenciais são obrigatórios.");
      return;
    }

    if (newAdminPassword !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }

    localStorage.setItem("admin_email", newAdminEmail);
    localStorage.setItem("admin_password", newAdminPassword);
    
    toast.success("Credenciais atualizadas! Por favor, faça login novamente.");
    
    // Logout the user to force new login
    setTimeout(() => {
      logout();
    }, 2000);
  };

  const handleTest = async () => {
    const result = await testConnection();
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };
1: 
2:   const handleExportBackup = () => {
3:     const backupData = {
4:       app_clients: JSON.parse(localStorage.getItem("app_clients") || "[]"),
5:       operator_statuses: JSON.parse(localStorage.getItem("operator_statuses") || "{}"),
6:       webhook_url: localStorage.getItem("webhook_url") || "",
7:       msg_alert: localStorage.getItem("msg_alert") || "",
8:       msg_thanks: localStorage.getItem("msg_thanks") || "",
9:       support_number: localStorage.getItem("support_number") || "",
10:       admin_email: localStorage.getItem("admin_email") || "",
11:       theme: localStorage.getItem("theme") || "light",
12:       export_date: new Date().toISOString()
13:     };
14: 
15:     const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
16:     const url = URL.createObjectURL(blob);
17:     const link = document.createElement("a");
18:     link.href = url;
19:     link.download = `backup_sistema_${new Date().toISOString().split('T')[0]}.json`;
20:     document.body.appendChild(link);
21:     link.click();
22:     document.body.removeChild(link);
23:     URL.revokeObjectURL(url);
24:     toast.success("Backup exportado com sucesso!");
25:   };
26: 
27:   const handleImportBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
28:     const file = event.target.files?.[0];
29:     if (!file) return;
30: 
31:     const reader = new FileReader();
32:     reader.onload = (e) => {
33:       try {
34:         const content = e.target?.result as string;
35:         const data = JSON.parse(content);
36: 
37:         // Basic validation
38:         if (!data.app_clients && !data.webhook_url) {
39:           throw new Error("Formato de backup inválido.");
40:         }
41: 
42:         // Update localStorage for each key if present in backup
43:         Object.keys(data).forEach(key => {
44:           if (key !== "export_date") {
45:             const value = typeof data[key] === "string" ? data[key] : JSON.stringify(data[key]);
46:             localStorage.setItem(key, value);
47:           }
48:         });
49: 
50:         toast.success("Backup importado! Reiniciando para aplicar alterações...");
51:         setTimeout(() => window.location.reload(), 2000);
52:       } catch (error: any) {
53:         toast.error(`Erro ao importar backup: ${error.message}`);
54:       }
55:     };
56:     reader.readAsText(file);
57:   };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Configurações</h1>
          <p className="text-slate-500">Ajuste as preferências globais do sistema.</p>
        </div>

        <div className="grid gap-6">
          {/* Painel de Edição de Mensagens e Suporte */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Modelos de Mensagens
              </CardTitle>
              <CardDescription>
                Personalize o conteúdo das notificações enviadas aos clientes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="msg-alert">Alerta Automático de Cobrança</Label>
                <Textarea 
                  id="msg-alert" 
                  rows={3} 
                  value={alertMsg} 
                  onChange={e => setAlertMsg(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="msg-thanks">Mensagem de 'Obrigado' (Pago Manual)</Label>
                <Textarea 
                  id="msg-thanks" 
                  rows={3} 
                  value={thanksMsg} 
                  onChange={e => setThanksMsg(e.target.value)} 
                />
              </div>

              {user?.role === "admin" && (
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <Label htmlFor="support-phone">Número de WhatsApp do Suporte</Label>
                  <Input 
                    id="support-phone" 
                    placeholder="(99) 99999-9999" 
                    value={supportNumber} 
                    onChange={handleSupportPhoneChange} 
                  />
                  <p className="text-[10px] text-muted-foreground italic">Este número será usado em todos os botões de suporte do sistema.</p>
                </div>
              )}

              <Button onClick={handleSaveSettings}>Salvar Configurações</Button>
            </CardContent>
          </Card>

          {/* Seção Motor de Cobrança */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="h-5 w-5 text-primary" />
                Configuração do Motor de Cobrança
              </CardTitle>
              <CardDescription>
                Defina o endpoint para recebimento de eventos de cobrança.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="webhook">URL da API / Webhook</Label>
                  <Input
                    id="webhook"
                    placeholder="https://api.seuservico.com/webhook"
                    value={url}
                    onChange={(e) => saveUrl(e.target.value)}
                  />
                </div>
                <Button onClick={handleTest} variant="outline" className="shrink-0">
                  Testar Conexão de Cobrança
                </Button>
              </div>

              {/* 3. Regras de Automação Visual */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Regras de Automação Ativas</h4>
                <div className="grid gap-3 sm:grid-cols-2">
                   <div className="flex items-center gap-2 p-2 rounded-md bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/20">
                      <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                      <span className="text-[11px] font-medium text-orange-700 dark:text-orange-400">Alerta 3 Dias Antes (Pendente)</span>
                   </div>
                   <div className="flex items-center gap-2 p-2 rounded-md bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20">
                      <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-[11px] font-medium text-red-700 dark:text-red-400">Cobrança 5 Dias Após (Vencido)</span>
                   </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {user?.role === "admin" && (
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCog className="h-5 w-5 text-primary" />
                    Alterar Dados de Acesso
                  </CardTitle>
                  <CardDescription>
                    Atualize o e-mail e a senha do administrador principal.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-email">Novo E-mail do Admin</Label>
                    <Input 
                      id="new-email" 
                      type="email" 
                      placeholder="admin@exemplo.com"
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Nova Senha</Label>
                    <Input 
                      id="new-password" 
                      type="password"
                      value={newAdminPassword}
                      onChange={(e) => setNewAdminPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                    <Input 
                      id="confirm-password" 
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleUpdateCredentials} className="w-full" variant="destructive">
                    <Lock className="mr-2 h-4 w-4" />
                    Salvar Novas Credenciais
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Preferências do Sistema</CardTitle>
                  <CardDescription>
                    Configurações restritas aos administradores.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label>Nome da Organização</Label>
                      <Input defaultValue="CobrançaSys Ltda" />
                    </div>
                    <div className="space-y-2">
                      <Label>Fuso Horário</Label>
                      <Input defaultValue="America/Sao_Paulo" />
                    </div>
                  </div>
                  <Button className="w-full">Salvar Preferências</Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
