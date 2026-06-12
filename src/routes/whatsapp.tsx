import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "../components/layout/dashboard-layout";
import { useState, useEffect, useCallback } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";
import { Smartphone, Loader2, RefreshCw, QrCode, LogOut, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/whatsapp")({
  component: WhatsAppPage,
});

type ConnectionState = "open" | "connecting" | "close" | "unknown";

function WhatsAppPage() {
  const [status, setStatus] = useState<ConnectionState>("unknown");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [loadingQr, setLoadingQr] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/whatsapp-status");
      const result = await response.json();
      if (result.success) {
        const state = result.data?.instance?.state || result.data?.state || "unknown";
        setStatus(state as ConnectionState);
        if (state === "open") {
          setQrCode(null);
        }
      } else {
        setStatus("unknown");
      }
    } catch (err) {
      console.error("Status error:", err);
      setStatus("unknown");
    } finally {
      setLoadingStatus(false);
    }
  }, []);

  const fetchQrCode = async () => {
    setLoadingQr(true);
    setQrCode(null);
    try {
      const response = await fetch("/api/whatsapp-connect");
      const result = await response.json();
      if (result.success) {
        const qr = result.data?.base64 || result.data?.qrcode?.base64 || result.data?.code;
        if (qr) {
          setQrCode(qr.startsWith("data:") ? qr : `data:image/png;base64,${qr}`);
          toast.success("QR Code gerado! Escaneie com o WhatsApp.");
        } else if (result.data?.instance?.state === "open") {
          setStatus("open");
          toast.success("WhatsApp já está conectado!");
        } else {
          toast.info("Aguardando QR Code...");
        }
      } else {
        toast.error("Erro ao gerar QR Code. Verifique se o servidor está ativo.");
      }
    } catch (err) {
      toast.error("Erro de conexão com o servidor WhatsApp.");
    } finally {
      setLoadingQr(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const response = await fetch("/api/whatsapp-connect", { method: "POST" });
      const result = await response.json();
      if (result.success) {
        toast.success("WhatsApp desconectado.");
        setStatus("close");
        setQrCode(null);
      } else {
        toast.error("Erro ao desconectar.");
      }
    } catch (err) {
      toast.error("Erro de conexão.");
    } finally {
      setLoggingOut(false);
      fetchStatus();
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  // Auto-refresh QR code when waiting for scan (QR expires after ~20s)
  useEffect(() => {
    if (qrCode && status !== "open") {
      const qrInterval = setInterval(() => {
        fetchQrCode();
      }, 25000);
      return () => clearInterval(qrInterval);
    }
  }, [qrCode, status]);

  const getStatusBadge = () => {
    switch (status) {
      case "open":
        return (
          <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20 gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Conectado
          </Badge>
        );
      case "connecting":
        return (
          <Badge className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20 gap-1.5">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Conectando...
          </Badge>
        );
      case "close":
        return (
          <Badge className="bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20 gap-1.5">
            <XCircle className="h-3.5 w-3.5" />
            Desconectado
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="gap-1.5">
            <AlertCircle className="h-3.5 w-3.5" />
            Desconhecido
          </Badge>
        );
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Conexão WhatsApp</h1>
          <p className="text-slate-500">Conecte o robô de cobrança ao seu WhatsApp escaneando o QR Code.</p>
        </div>

        <Card className="max-w-2xl border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Smartphone className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <CardTitle>Status da Conexão</CardTitle>
                  <CardDescription>Instância: <code className="text-xs">cobranca</code></CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {loadingStatus ? (
                  <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                ) : (
                  getStatusBadge()
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {status === "open" ? (
              <div className="text-center py-8 space-y-4">
                <div className="inline-flex p-4 rounded-full bg-green-500/10">
                  <CheckCircle2 className="h-12 w-12 text-green-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">WhatsApp Conectado!</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    O robô está ativo e pronto para enviar cobranças automaticamente.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                >
                  {loggingOut ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <LogOut className="h-4 w-4 mr-2" />}
                  Desconectar WhatsApp
                </Button>
              </div>
            ) : qrCode ? (
              <div className="space-y-4">
                <div className="flex justify-center bg-white p-4 rounded-lg border border-slate-200">
                  <img src={qrCode} alt="QR Code WhatsApp" className="w-64 h-64" />
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 space-y-2 bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
                  <p className="font-semibold text-slate-900 dark:text-white">Como conectar:</p>
                  <ol className="list-decimal list-inside space-y-1 text-xs">
                    <li>Abra o WhatsApp no seu celular</li>
                    <li>Toque em <strong>Mais opções (⋮)</strong> ou <strong>Configurações</strong></li>
                    <li>Toque em <strong>Aparelhos conectados</strong></li>
                    <li>Toque em <strong>Conectar um aparelho</strong></li>
                    <li>Aponte a câmera para esta tela para capturar o QR Code</li>
                  </ol>
                </div>
                <Button
                  variant="outline"
                  onClick={fetchQrCode}
                  disabled={loadingQr}
                  className="w-full"
                >
                  {loadingQr ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                  Gerar Novo QR Code
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 space-y-4">
                <div className="inline-flex p-4 rounded-full bg-slate-100 dark:bg-slate-800">
                  <QrCode className="h-12 w-12 text-slate-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">WhatsApp não conectado</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Clique no botão abaixo para gerar o QR Code de conexão.
                  </p>
                </div>
                <Button
                  onClick={fetchQrCode}
                  disabled={loadingQr}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {loadingQr ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <QrCode className="h-4 w-4 mr-2" />}
                  Gerar QR Code
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="max-w-2xl border-slate-200 dark:border-slate-800 shadow-sm bg-blue-50/50 dark:bg-blue-950/20">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
                <p className="font-semibold">Sessão persistente</p>
                <p className="text-xs">
                  A sessão do WhatsApp fica armazenada no servidor (VPS) através da Evolution API. Após escanear o QR Code uma vez, o robô permanecerá conectado mesmo após reinicializações do sistema — não é necessário escanear novamente.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
