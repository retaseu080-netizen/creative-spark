import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { CheckCircle2, MessageSquare, PieChart, ShieldCheck, Globe, Eye, EyeOff, ArrowLeft, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/landing")({
  component: LandingPage,
});

export default function LandingPage() {
  const navigate = useNavigate();
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
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.honeypot) return;

    setLoading(true);
    try {
      // 1. Realizar o cadastro no banco de dados (Supabase Auth)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: `${formData.name} ${formData.lastName}`,
            role: 'admin',
          }
        }
      });

      if (authError) throw authError;

      // 2. Criar configuração da revenda
      if (authData.user) {
        const { error: settingsError } = await supabase
          .from('resale_settings')
          .insert({
            id: authData.user.id,
            resale_name: formData.resaleName,
            pix_key: "seu-email-ou-cpf@dominio.com",
            beneficiary_name: "Seu Nome Completo",
          });
        
        if (settingsError) {
          console.error("Erro ao criar configurações da revenda:", settingsError);
        }
      }

      // 3. Processo de disparar o WhatsApp para a VPS em segundo plano (Assíncrono)
      const minhaChavePix = "seu-email-ou-cpf@dominio.com"; 
      const nomeBeneficiario = "Seu Nome Completo";
      const numeroFormatado = (countryCode + formData.phone).replace(/\D/g, "");
      const numeroFinal = numeroFormatado.startsWith("55") ? numeroFormatado : `55${numeroFormatado}`;
      const textoMensagem = `Olá, *${formData.name}*!\n\nSua conta foi criada com sucesso na revenda *${formData.resaleName}*.\n\nSegue os dados para o pagamento da sua cobrança:\n\n💰 *Valor:* R$ ${formData.valor}\n🔑 *Chave Pix:* ${minhaChavePix}\n👤 *Beneficiário:* ${nomeBeneficiario}\n\nApós realizar o pagamento, envie o comprovante pelo painel!`;

      // Rodar de forma totalmente assíncrona (em segundo plano)
      // Envolto em um bloco try-catch isolado
      (async () => {
        try {
          await fetch("/api/send-whatsapp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              number: numeroFinal,
              message: textoMensagem,
            }),
          });
        } catch (err) {
          console.error("Erro em segundo plano ao enviar WhatsApp:", err);
          // O sistema ignora o erro e deixa o usuário entrar no painel
        }
      })();

      toast.success("Conta criada com sucesso! Redirecionando...");
      
      // Login automático e entrada no painel imediatamente
      navigate({ to: "/" });

    } catch (err: any) {
      toast.error(err.message || "Erro ao processar cadastro.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copiado para a área de transferência!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-red-100 selection:text-red-900">
      {/* Hero Section */}
      <header className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-32">
        <div className="container px-4 mx-auto relative z-10">
          <div className="flex flex-wrap items-center -mx-4">
            <div className="w-full lg:w-1/2 px-4 mb-16 lg:mb-0">
              <div className="max-w-xl">
                <span className="inline-block py-1 px-3 mb-4 text-xs font-semibold tracking-widest text-red-600 uppercase bg-red-50 dark:bg-red-900/20 rounded-full">
                  Configuração em 2 minutos
                </span>
                <h1 className="text-4xl lg:text-6xl font-extrabold text-slate-900 dark:text-white mb-6 leading-tight">
                  Gerencie sua revenda com total controle e automação
                </h1>
                <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                  Organize clientes, automatize cobranças e nunca mais perca um vencimento.
                </p>
                <div className="flex flex-wrap gap-4 items-center mb-12">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span>Comece a usar imediatamente, sem instalação.</span>
                  </div>
                </div>
                
                {/* Benefits Section (Cards) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <BenefitCard 
                    icon={<MessageSquare className="w-6 h-6 text-red-600" />}
                    title="Cobranças automáticas via WhatsApp"
                    description="Envio de mensagens e alertas automáticos para seus clientes."
                  />
                  <BenefitCard 
                    icon={<PieChart className="w-6 h-6 text-red-600" />}
                    title="Painel financeiro completo"
                    description="Controle total de receitas, despesas e inadimplência."
                  />
                  <BenefitCard 
                    icon={<ShieldCheck className="w-6 h-6 text-red-600" />}
                    title="Sistema seguro e disponível 24/7"
                    description="Seus dados protegidos com acesso a qualquer momento."
                  />
                  <div className="bg-red-50/50 dark:bg-red-900/10 p-6 rounded-2xl border border-red-100 dark:border-red-900/30 shadow-sm flex flex-col justify-center items-center text-center">
                    <p className="text-xs font-bold text-red-600 uppercase tracking-widest mb-2">10 dias grátis</p>
                    <ul className="text-xs font-medium text-slate-700 dark:text-slate-300 space-y-1">
                      <li>• Acesso completo</li>
                      <li>• Sem Fidelidade</li>
                      <li>• Cancele quando quiser</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="w-full lg:w-1/2 px-4">
              <Card className="max-w-md mx-auto shadow-2xl border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden">
                <CardHeader className="bg-white dark:bg-slate-900 pb-2 border-b border-slate-50 dark:border-slate-800 relative">
                  <Link 
                    to="/" 
                    className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"
                    title="Sair"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Link>
                  <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">Crie sua conta</CardTitle>
                  <CardDescription className="text-slate-500">
                    Preencha os dados abaixo e comece agora mesmo
                  </CardDescription>
                </CardHeader>
                <CardContent className="bg-white dark:bg-slate-900 pt-6">
                  {!pixInfo ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Honeypot Field */}
                      <div className="hidden" aria-hidden="true">
                        <Label htmlFor="honeypot">Não preencha este campo</Label>
                        <Input
                          id="honeypot"
                          name="honeypot"
                          type="text"
                          autoComplete="off"
                          value={formData.honeypot}
                          onChange={(e) => setFormData({...formData, honeypot: e.target.value})}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Nome *</Label>
                          <Input
                            id="name"
                            placeholder="Seu nome"
                            required
                            className="h-11"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Sobrenome</Label>
                          <Input
                            id="lastName"
                            placeholder="Seu sobrenome"
                            className="h-11"
                            value={formData.lastName}
                            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefone (DDD) *</Label>
                        <div className="flex gap-2">
                          <div className="relative w-32">
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                            <select 
                              className="w-full h-11 pl-9 pr-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
                              value={countryCode}
                              onChange={(e) => setCountryCode(e.target.value)}
                            >
                              <option value="+55">🇧🇷 +55</option>
                              <option value="+1">🇺🇸 +1</option>
                              <option value="+351">🇵🇹 +351</option>
                              <option value="+44">🇬🇧 +44</option>
                              <option value="+34">🇪🇸 +34</option>
                            </select>
                          </div>
                          <Input
                            id="phone"
                            className="flex-1 h-11"
                            placeholder="(00) 00000-0000"
                            required
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="valor">Valor da Cobrança (R$) *</Label>
                        <Input
                          id="valor"
                          type="number"
                          placeholder="0,00"
                          required
                          className="h-11"
                          value={formData.valor}
                          onChange={(e) => setFormData({...formData, valor: e.target.value})}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="resaleName">Nome da Revenda *</Label>
                        <Input
                          id="resaleName"
                          placeholder="Sua revenda"
                          required
                          className="h-11"
                          value={formData.resaleName}
                          onChange={(e) => setFormData({...formData, resaleName: e.target.value})}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">E-mail *</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="seu@email.com"
                          required
                          className="h-11"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password">Senha *</Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Crie uma senha segura"
                            required
                            className="h-11 pr-10"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full h-12 text-lg font-bold bg-red-600 hover:bg-red-700 text-white transition-all shadow-lg hover:shadow-red-500/25 mt-2"
                        disabled={loading}
                      >
                        {loading ? "Processando..." : "Criar minha conta grátis"}
                      </Button>
                      
                      <p className="text-[11px] text-center text-slate-500 leading-relaxed mt-6">
                        Ao criar sua conta, você concorda com os <Link to="/" className="underline hover:text-red-600 font-medium">Termos de Uso</Link> e <Link to="/" className="underline hover:text-red-600 font-medium">Política de Privacidade</Link>
                      </p>
                    </form>
                  ) : (
                    <div className="space-y-6 animate-in fade-in zoom-in duration-300">
                      <div className="bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 p-6 rounded-2xl text-center">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                          <CheckCircle2 className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Conta pré-registrada!</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Enviamos os dados de pagamento para o seu WhatsApp. Você também pode pagar agora usando os dados abaixo:
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Beneficiário</Label>
                          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 font-medium text-slate-900 dark:text-white">
                            {pixInfo.beneficiario}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Chave Pix (E-mail/CPF)</Label>
                          <div className="relative group">
                            <div className="p-3 pr-12 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 font-mono text-sm text-slate-900 dark:text-white break-all">
                              {pixInfo.chave}
                            </div>
                            <button
                              onClick={() => copyToClipboard(pixInfo.chave)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors"
                              title="Copiar chave"
                            >
                              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-slate-400" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <Button 
                        variant="outline" 
                        className="w-full h-11"
                        onClick={() => setPixInfo(null)}
                      >
                        Voltar para o formulário
                      </Button>

                      <p className="text-xs text-center text-slate-500 italic">
                        Após o pagamento, envie o comprovante pelo WhatsApp.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        
        {/* Background elements */}
        <div className="absolute top-0 right-0 -z-10 w-1/2 h-full bg-red-50/50 dark:bg-red-950/10 blur-[120px] rounded-full opacity-50 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 -z-10 w-1/3 h-1/2 bg-blue-50/50 dark:bg-blue-950/10 blur-[120px] rounded-full opacity-50 -translate-x-1/4"></div>
      </header>
    </div>
  );
}

function BenefitCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group border-l-4 border-l-red-600">
      <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
        {icon}
      </div>
      <h3 className="font-bold text-slate-900 dark:text-white mb-2 text-sm">{title}</h3>
      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
        {description}
      </p>
    </div>
  );
}

