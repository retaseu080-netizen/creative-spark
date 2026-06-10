import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "../hooks/use-auth";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { toast } from "sonner";
import { MessageCircleQuestion } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: LoginComponent,
});

function LoginComponent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(email, password)) {
      toast.success("Login realizado com sucesso!");
    } else {
      toast.error("Credenciais inválidas.");
    }
  };

  const handleSupport = () => {
    const rawNumber = localStorage.getItem("support_number") || "5511999999999";
    const cleanNumber = rawNumber.replace(/\D/g, "");
    const text = encodeURIComponent("Olá! Estou na tela de login do painel e preciso de ajuda com o meu acesso.");
    window.open(`https://wa.me/${cleanNumber.startsWith("55") ? cleanNumber : "55" + cleanNumber}?text=${text}`, "_blank");
  };

  return (
    <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <div className="w-full max-w-md space-y-4">
        <Card className="shadow-lg border-slate-200 dark:border-slate-800">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold dark:text-white text-center">Acesso ao Sistema</CardTitle>
            <CardDescription className="text-center">
              Entre com suas credenciais para gerenciar cobranças
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="dark:bg-slate-900"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="dark:bg-slate-900"
                />
              </div>
              <Button type="submit" className="w-full h-11">
                Entrar
              </Button>
            </form>
            
            <div className="mt-4 text-center space-y-2">
              <Link to="/" className="block text-sm text-slate-500 hover:text-red-600 transition-colors">
                Não tem uma conta? <span className="font-bold underline">Crie agora</span>
              </Link>
              <button 
                onClick={handleSupport}
                className="text-sm text-slate-500 hover:text-primary transition-colors font-medium underline-offset-4 hover:underline"
              >
                Precisa de ajuda? Fale com o Suporte
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


