import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { CheckCircle2, MessageSquare, PieChart, ShieldCheck, Globe } from "lucide-react";
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.honeypot) return; // Honeypot check
    
    console.log("Form data:", { ...formData, phone: countryCode + formData.phone });
    toast.success("Conta criada com sucesso! Redirecionando...");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-red-100 selection:text-red-900">
      {/* Hero Section */}
      <header className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-32">
        <div className="container px-4 mx-auto relative z-10">
          <div className="flex flex-wrap items-center -mx-4">
            <div className="w-full lg:w-1/2 px-4 mb-16 lg:mb-0">
              <div className="max-w-xl">
                <span className="inline-block py-1 px-3 mb-4 text-xs font-semibold tracking-widest text-red-600 uppercase bg-red-50 rounded-full">
                  Configuração em 2 minutos
                </span>
                <h1 className="text-4xl lg:text-6xl font-extrabold text-slate-900 dark:text-white mb-6 leading-tight">
                  Gerencie sua revenda com total controle e automação
                </h1>
                <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                  Organize clientes, automatize cobranças e nunca mais perca um vencimento.
                </p>
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span>Comece a usar imediatamente, sem instalação.</span>
                  </div>
                </div>
                
                {/* Benefits Section (Cards) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12">
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
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center items-center text-center border-dashed">
                    <p className="text-sm font-bold text-red-600 uppercase tracking-tighter">Oferta Especial</p>
                    <ul className="text-xs text-slate-600 dark:text-slate-400 mt-2 space-y-1">
                      <li>• 10 dias grátis — Acesso completo</li>
                      <li>• Sem Fidelidade</li>
                      <li>• Cancele quando quiser</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="w-full lg:w-1/2 px-4">
              <Card className="max-w-md mx-auto shadow-2xl border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden">
                <CardHeader className="bg-white dark:bg-slate-900 pb-2">
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
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Sobrenome</Label>
                        <Input
                          id="lastName"
                          placeholder="Seu sobrenome"
                          value={formData.lastName}
                          onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone (DDD) *</Label>
                      <div className="flex gap-2">
                        <div className="relative w-28">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <select 
                            className="w-full h-10 pl-8 pr-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-red-500"
                            value={countryCode}
                            onChange={(e) => setCountryCode(e.target.value)}
                          >
                            <option value="+55">+55 (BR)</option>
                            <option value="+1">+1 (US)</option>
                            <option value="+351">+351 (PT)</option>
                            <option value="custom">Intl.</option>
                          </select>
                        </div>
                        <Input
                          id="phone"
                          className="flex-1"
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
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Senha *</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Crie uma senha segura"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                      />
                    </div>

                    <Button type="submit" className="w-full h-12 text-lg font-bold bg-red-600 hover:bg-red-700 text-white transition-all shadow-lg hover:shadow-red-500/25">
                      Criar minha conta grátis
                    </Button>
                    
                    <p className="text-[10px] text-center text-slate-500 leading-relaxed mt-4">
                      Ao criar sua conta, você concorda com os <Link to="/" className="underline hover:text-red-600">Termos de Uso</Link> e <Link to="/" className="underline hover:text-red-600">Política de Privacidade</Link>
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        
        {/* Background shapes */}
        <div className="absolute top-0 right-0 -z-10 w-1/3 h-1/2 bg-red-50 dark:bg-red-950/10 blur-[120px] rounded-full opacity-50"></div>
        <div className="absolute bottom-0 left-0 -z-10 w-1/4 h-1/2 bg-blue-50 dark:bg-blue-950/10 blur-[120px] rounded-full opacity-50"></div>
      </header>
    </div>
  );
}

function BenefitCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
      <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="font-bold text-slate-900 dark:text-white mb-2 text-sm">{title}</h3>
      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
        {description}
      </p>
    </div>
  );
}
