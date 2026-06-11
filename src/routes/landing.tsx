import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { CheckCircle2, MessageSquare, PieChart, ShieldCheck, Globe, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/landing")({
  component: LandingPage,
});

export default function LandingPage() {
  const [formData, setFormData] = useState({
    name: "",
    lastName: "",
    phone: "",
    resaleName: "",
    email: "",
    password: "",
    valor: "",
    honeypot: "",
  });

  const [countryCode, setCountryCode] = useState("+55");
  const [showPassword, setShowPassword] = useState(false);
  const [pixInfo, setPixInfo] = useState<{ chave: string; beneficiario: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.honeypot) return;

    setLoading(true);
    try {
      const response = await fetch("/api/cobranca", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          valor: formData.valor,
          clienteNome: formData.name,
          whatsappCliente: countryCode + formData.phone,
        }),
      });

      const data = await response.json();
      if (data.sucesso) {
        setPixInfo({ chave: data.chave, beneficiario: data.beneficiario });
        toast.success(data.mensagem);
      } else {
        toast.error("Erro ao processar cobrança.");
      }
    } catch (err) {
      toast.error("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans p-6">
      <Card className="max-w-md mx-auto shadow-2xl rounded-3xl overflow-hidden">
        <CardHeader className="bg-white pb-2 border-b border-slate-50 relative">
          <Link to="/" className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <CardTitle className="text-2xl font-bold">Simulador de Cobrança</CardTitle>
          <CardDescription>Preencha para gerar o Pix</CardDescription>
        </CardHeader>
        <CardContent className="bg-white pt-6">
          {!pixInfo ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input placeholder="Nome" required onChange={(e) => setFormData({...formData, name: e.target.value})} />
              <Input placeholder="WhatsApp" required onChange={(e) => setFormData({...formData, phone: e.target.value})} />
              <Input type="number" placeholder="Valor" required onChange={(e) => setFormData({...formData, valor: e.target.value})} />
              <Button type="submit" className="w-full h-12 bg-red-600 hover:bg-red-700" disabled={loading}>
                {loading ? "Processando..." : "Criar minha conta grátis"}
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="font-bold text-green-700">Cobrança Gerada!</p>
                <p className="text-sm">Chave Pix: {pixInfo.chave}</p>
                <p className="text-sm">Beneficiário: {pixInfo.beneficiario}</p>
              </div>
              <Button onClick={() => setPixInfo(null)} variant="outline">Nova cobrança</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
