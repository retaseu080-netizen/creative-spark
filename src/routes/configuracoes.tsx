import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { DashboardLayout } from "../components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { useAuth } from "../hooks/use-auth";
import { useWebhook } from "../hooks/use-webhook";
import { toast } from "sonner";
import { useEffect } from "react";

export const Route = createFileRoute("/configuracoes")({
  component: SettingsComponent,
});

function SettingsComponent() {
  const { user } = useAuth();
  const { url, saveUrl, testConnection } = useWebhook();

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
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Configurações</h1>
          <p className="text-slate-500">Ajuste as preferências globais do sistema.</p>
        </div>

        <div className="grid gap-6">
          {/* Seção Motor de Cobrança - Visível para Ambos */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Configuração do Motor de Cobrança</CardTitle>
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

          {/* Seção Administrativa - Apenas Admin */}
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
