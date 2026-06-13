import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "../components/layout/dashboard-layout";
import { useState, useEffect, useCallback } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";
import {
  Smartphone, Loader2, RefreshCw, QrCode, LogOut,
  CheckCircle2, XCircle, AlertCircle, Save, Plug,
} from "lucide-react";
import {
  useEvolutionConfig, evolutionCreateInstance, evolutionConnect,
  evolutionStatus, evolutionLogout,
} from "../hooks/use-evolution";

export const Route = createFileRoute("/whatsapp")({
  component: WhatsAppPage,
});

type ConnectionState = "open" | "connecting" | "close" | "unknown";

function WhatsAppPage() {
  const { config, save } = useEvolutionConfig();
  const [url, setUrl] = useState(config.url);
  const [apikey, setApikey] = useState(config.apikey);
  const [instance, setInstance] = useState(config.instance || "cobranca");

  const [status, setStatus] = useState<ConnectionState>("unknown");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loadingQr, setLoadingQr] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    setUrl(config.url);
    setApikey(config.apikey);
    setInstance(config.instance || "cobranca");
  }, [config]);

  const isConfigured = Boolean(config.url && config.apikey && config.instance);

  const fetchStatus = useCallback(async () => {
    if (!isConfigured) return;
    try {
      const result = await evolutionStatus(config);
      if (result.success) {
        const state = result.data?.instance?.state || result.data?.state || "unknown";
        setStatus(state as ConnectionState);
        if (state === "open") setQrCode(null);
      } else {
        setStatus("unknown");
      }
    } catch {
      setStatus("unknown");
    }
  }, [config, isConfigured]);

  useEffect(() => {
    if (!isConfigured) return;
    fetchStatus();
    const i = setInterval(fetchStatus, 5000);
    return () => clearInterval(i);
  }, [fetchStatus, isConfigured]);

  const handleSave = () => {
    if (!url || !apikey || !instance) {
      toast.error("Preencha URL, ApiKey e nome da instância.");
      return;
    }
    save({ url: url.trim(), apikey: apikey.trim(), instance: instance.trim() });
    toast.success("Configuração salva.");
  };

  const extractQr = (data: any): string | null => {
    const qr =
      data?.qrcode?.base64 ||
      data?.base64 ||
      data?.qrcode?.code ||
      data?.code ||
      null;
    if (!qr) return null;
    return qr.startsWith("data:") ? qr : `data:image/png;base64,${qr}`;
  };

  const handleGenerateQr = async () => {
    if (!isConfigured) {
      toast.error("Salve a configuração primeiro.");
      return;
    }
    setLoadingQr(true);
    setQrCode(null);
    try {
      // 1) Tenta criar a instância (idempotente do ponto de vista do usuário)
      let result = await evolutionCreateInstance(config);
      let qr = result.success ? extractQr(result.data) : null;

      // 2) Se já existir, faz connect para receber o QR atualizado
      if (!qr) {
        const connectResult = await evolutionConnect(config);
        if (connectResult.success) {
          qr = extractQr(connectResult.data);
          if (!qr && (connectResult.data?.instance?.state === "open")) {
            setStatus("open");
            toast.success("WhatsApp já está conectado!");
            return;
          }
        }
      }

      if (qr) {
        setQrCode(qr);
        toast.success("QR Code gerado! Escaneie com o WhatsApp.");
      } else {
        toast.error("Não foi possível obter o QR Code. Verifique URL e ApiKey.");
      }
    } catch (err: any) {
      toast.error("Erro ao conectar com a Evolution API.");
    } finally {
      setLoadingQr(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const result = await evolutionLogout(config);
      if (result.success) {
        toast.success("WhatsApp desconectado.");
        setStatus("close");
        setQrCode(null);
      } else {
        toast.error("Erro ao desconectar.");
      }
    } finally {
      setLoggingOut(false);
      fetchStatus();
    }
  };

  // Auto-refresh QR while waiting
  useEffect(() => {
    if (qrCode && status !== "open") {
      const i = setInterval(handleGenerateQr, 25000);
      return () => clearInterval(i);
    }
  }, [qrCode, status]); // eslint-disable-line react-hooks/exhaustive-deps

  const getStatusBadge = () => {
    switch (status) {
      case "open":
        return <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20 gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" />Conectado</Badge>;
      case "connecting":
        return <Badge className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20 gap-1.5"><Loader2 className="h-3.5 w-3.5 animate-spin" />Conectando...</Badge>;
      case "close":
        return <Badge className="bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20 gap-1.5"><XCircle className="h-3.5 w-3.5" />Desconectado</Badge>;
      default:
        return <Badge variant="outline" className="gap-1.5"><AlertCircle className="h-3.5 w-3.5" />Desconhecido</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Conexão WhatsApp</h1>
          <p className="text-sm text-slate-500">Configure a Evolution API e conecte o robô de cobrança.</p>
        </div>

        {/* Config */}
        <Card className="max-w-2xl border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg"><Plug className="h-5 w-5 text-primary" /></div>
              <div>
                <CardTitle className="text-base sm:text-lg">Configuração da API</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Salve a URL da Evolution API e a chave de acesso.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="evo-url">URL da API</Label>
              <Input id="evo-url" inputMode="url" placeholder="http://IP_DA_VPS:8080" value={url} onChange={e => setUrl(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="evo-key">ApiKey (Token)</Label>
              <Input id="evo-key" placeholder="Sua chave de acesso" value={apikey} onChange={e => setApikey(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="evo-inst">Nome da Instância</Label>
              <Input id="evo-inst" placeholder="cobranca" value={instance} onChange={e => setInstance(e.target.value)} />
            </div>
            <Button onClick={handleSave} className="w-full h-11">
              <Save className="h-4 w-4 mr-2" /> Salvar Configuração
            </Button>
          </CardContent>
        </Card>

        {/* Status + QR */}
        <Card className="max-w-2xl border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg"><Smartphone className="h-5 w-5 text-green-500" /></div>
                <div>
                  <CardTitle className="text-base sm:text-lg">Status da Conexão</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Instância: <code className="text-xs">{config.instance || "—"}</code>
                  </CardDescription>
                </div>
              </div>
              {getStatusBadge()}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isConfigured ? (
              <div className="text-center text-sm text-slate-500 py-6">
                Salve a configuração da API acima para começar.
              </div>
            ) : status === "open" ? (
              <div className="text-center py-6 space-y-3">
                <div className="inline-flex p-3 rounded-full bg-green-500/10">
                  <CheckCircle2 className="h-10 w-10 text-green-500" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white">WhatsApp Conectado!</h3>
                  <p className="text-sm text-slate-500">O robô está pronto para enviar cobranças.</p>
                </div>
                <Button variant="outline" onClick={handleLogout} disabled={loggingOut}
                  className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800">
                  {loggingOut ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <LogOut className="h-4 w-4 mr-2" />}
                  Desconectar
                </Button>
              </div>
            ) : qrCode ? (
              <div className="space-y-3">
                <div className="flex justify-center bg-white p-4 rounded-lg border border-slate-200">
                  <img src={qrCode} alt="QR Code WhatsApp" className="w-56 h-56 sm:w-64 sm:h-64" />
                </div>
                <p className="text-xs text-center text-slate-500">
                  WhatsApp → Aparelhos conectados → Conectar um aparelho.
                </p>
                <Button variant="outline" onClick={handleGenerateQr} disabled={loadingQr} className="w-full">
                  {loadingQr ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                  Gerar Novo QR Code
                </Button>
              </div>
            ) : (
              <Button onClick={handleGenerateQr} disabled={loadingQr} className="w-full h-11 bg-green-600 hover:bg-green-700">
                {loadingQr ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <QrCode className="h-4 w-4 mr-2" />}
                Gerar QR Code
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
