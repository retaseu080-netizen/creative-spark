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
import { MessageSquare, Settings2 } from "lucide-react";

export const Route = createFileRoute("/configuracoes")({
  component: SettingsComponent,
});

function SettingsComponent() {
  const { user } = useAuth();
  const { url, saveUrl, testConnection } = useWebhook();
  
  const [alertMsg, setAlertMsg] = useState(() => localStorage.getItem("msg_alert") || "Olá! Identificamos uma cobrança pendente em seu nome. Por favor, regularize clicando no link abaixo.");
  const [thanksMsg, setThanksMsg] = useState(() => localStorage.getItem("msg_thanks") || "Obrigado! Seu pagamento foi confirmado com sucesso.");

  const handleSaveMessages = () => {
    localStorage.setItem("msg_alert", alertMsg);
    localStorage.setItem("msg_thanks", thanksMsg);
    toast.success("Modelos de mensagens salvos!");
  };

  const handleTest = async () => {
    const result = await testConnection();
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Configurações</h1>
          <p className="text-slate-500">Ajuste as preferências globais do sistema.</p>
        </div>

        <div className="grid gap-6">
          {/* Painel de Edição de Mensagens (Disparos) */}
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
              <Button onClick={handleSaveMessages}>Salvar Modelos</Button>
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
            </CardContent>
          </Card>

          {user?.role === "admin" && (
            <Card>
              <CardHeader>
                <CardTitle>Preferências do Sistema</CardTitle>
                <CardDescription>
                  Configurações restritas aos administradores.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome da Organização</Label>
                    <Input defaultValue="CobrançaSys Ltda" />
                  </div>
                  <div className="space-y-2">
                    <Label>Fuso Horário</Label>
                    <Input defaultValue="America/Sao_Paulo" />
                  </div>
                </div>
                <Button>Salvar Preferências</Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
