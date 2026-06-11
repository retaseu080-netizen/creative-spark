import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "../components/layout/dashboard-layout";
import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Wallet, Loader2 } from "lucide-react";

export const Route = createFileRoute("/configuracoes")({
  component: SettingsComponent,
});

function SettingsComponent() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [pixKey, setPixKey] = useState("");
  const [beneficiaryName, setBeneficiaryName] = useState("");
  const [resaleName, setResaleName] = useState("");
  const [settingsId, setSettingsId] = useState<string | null>(null);

  const fetchSettings = async () => {
    setFetching(true);
    const { data, error } = await supabase
      .from('resale_settings')
      .select('*')
      .maybeSingle();
    
    if (error) {
      console.error("Erro ao carregar configurações:", error);
    } else if (data) {
      setSettingsId(data.id);
      setPixKey(data.pix_key || "");
      setBeneficiaryName(data.beneficiary_name || "");
      setResaleName(data.resale_name || "");
    }
    setFetching(false);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      pix_key: pixKey,
      beneficiary_name: beneficiaryName,
      resale_name: resaleName,
    };

    let error;
    if (settingsId) {
      const { error: updateError } = await supabase
        .from('resale_settings')
        .update(payload)
        .eq('id', settingsId);
      error = updateError;
    } else {
      const { data, error: insertError } = await supabase
        .from('resale_settings')
        .insert([payload])
        .select()
        .single();
      if (data) setSettingsId(data.id);
      error = insertError;
    }

    if (error) {
      toast.error("Erro ao salvar configurações: " + error.message);
    } else {
      toast.success("Configurações salvas com sucesso!");
    }
    setLoading(false);
  };

  if (fetching) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Dados de Recebimento</h1>
          <p className="text-slate-500">Configure as informações que seus clientes usarão para pagamento.</p>
        </div>

        <Card className="max-w-2xl border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Configurações de Pagamento</CardTitle>
                <CardDescription>Dados para geração de cobrança via Pix.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resaleName">Nome da Revenda</Label>
                <Input 
                  id="resaleName" 
                  placeholder="Ex: Minha Revenda IPTV" 
                  value={resaleName} 
                  onChange={e => setResaleName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pixKey">Chave Pix</Label>
                <Input 
                  id="pixKey" 
                  placeholder="E-mail, CPF, CNPJ ou Chave Aleatória" 
                  value={pixKey} 
                  onChange={e => setPixKey(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="beneficiaryName">Nome do Beneficiário</Label>
                <Input 
                  id="beneficiaryName" 
                  placeholder="Nome completo conforme registrado no banco" 
                  value={beneficiaryName} 
                  onChange={e => setBeneficiaryName(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full h-11" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Salvar Configurações
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
