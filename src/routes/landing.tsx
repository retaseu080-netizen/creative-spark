import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { CheckCircle2, MessageSquare, PieChart, ShieldCheck, Globe, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/landing")({
  component: LandingPage,
});

function LandingPage() {
  const [formData, setFormData] = useState({
    name: "",
    lastName: "",
    phone: "",
    resaleName: "",
    email: "",
    password: "",
    honeypot: "",
  });

  const [countryCode, setCountryCode] = useState("+55");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.honeypot) {
      console.log("Bot detected");
      return;
    }
    
    // Simulating account creation
    console.log("Creating account for:", { ...formData, phone: countryCode + formData.phone });
    
    // Preparing data for saving/redirection as requested
    localStorage.setItem("pending_registration", JSON.stringify({
      ...formData,
      fullPhone: countryCode + formData.phone,
      createdAt: new Date().toISOString()
    }));

    toast.success("Conta criada com sucesso! Redirecionando...");
    
    setTimeout(() => {
      window.location.href = "/login";
    }, 1500);
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
                <CardHeader className="bg-white dark:bg-slate-900 pb-2 border-b border-slate-50 dark:border-slate-800">
                  <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">Crie sua conta</CardTitle>
                  <CardDescription className="text-slate-500">
                    Preencha os dados abaixo e comece agora mesmo
                  </CardDescription>
                </CardHeader>
                <CardContent className="bg-white dark:bg-slate-900 pt-6">
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

                    <Button type="submit" className="w-full h-12 text-lg font-bold bg-red-600 hover:bg-red-700 text-white transition-all shadow-lg hover:shadow-red-500/25 mt-2">
                      Criar minha conta grátis
                    </Button>
                    
                    <p className="text-[11px] text-center text-slate-500 leading-relaxed mt-6">
                      Ao criar sua conta, você concorda com os <Link to="/" className="underline hover:text-red-600 font-medium">Termos de Uso</Link> e <Link to="/" className="underline hover:text-red-600 font-medium">Política de Privacidade</Link>
                    </p>
                  </form>
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

