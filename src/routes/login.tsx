import { createFileRoute } from "@tanstack/react-router";
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
    window.open("https://wa.me/5511999999999?text=Olá, preciso de ajuda com o acesso ao sistema.", "_blank");
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
          </CardContent>
        </Card>
        
        <div className="flex justify-center">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSupport}
            className="flex items-center gap-2 text-slate-500 hover:text-primary border-slate-200 dark:border-slate-800"
          >
            <MessageCircleQuestion className="h-4 w-4" />
            Suporte
          </Button>
        </div>
      </div>
    </div>
  );
}

