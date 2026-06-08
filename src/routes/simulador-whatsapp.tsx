import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "../components/layout/dashboard-layout";
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { MessageSquare, Send, CheckCircle2, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/simulador-whatsapp")({
  component: WhatsAppSimulatorComponent,
});

function WhatsAppSimulatorComponent() {
  const [contacts, setContacts] = useState(500);
  const [message, setMessage] = useState("Olá, identificamos um pagamento pendente em seu nome. Regularize agora!");
  const [returnRate, setReturnRate] = useState(15);

  const stats = useMemo(() => {
    const totalSent = contacts;
    const responded = Math.floor(contacts * (returnRate / 100));
    const paid = Math.floor(responded * 0.4); // Estimativa conservadora de 40% das respostas virarem pagamento

    return {
      totalSent,
      responded,
      paid
    };
  }, [contacts, returnRate]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Simulador WhatsApp</h1>
          <p className="text-slate-500">Projete o impacto dos seus disparos de cobrança pelo WhatsApp.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Entradas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-green-500" />
                Configurações da Simulação
              </CardTitle>
              <CardDescription>Defina os parâmetros do seu disparo.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contacts">Quantidade de Contatos</Label>
                <Input 
                  id="contacts" 
                  type="number" 
                  value={contacts} 
                  onChange={e => setContacts(Number(e.target.value))} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Mensagem de Cobrança</Label>
                <Textarea 
                  id="message" 
                  rows={4} 
                  placeholder="Digite o texto do disparo..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="return">Taxa de Retorno Estimada (%)</Label>
                <Input 
                  id="return" 
                  type="number" 
                  value={returnRate} 
                  onChange={e => setReturnRate(Number(e.target.value))} 
                />
              </div>
            </CardContent>
          </Card>

          {/* Resultados */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 px-1">Resultados Projetados</h3>
            
            <div className="grid grid-cols-1 gap-4">
              <Card className="bg-white dark:bg-slate-900 border-l-4 border-l-blue-500">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-xs font-medium text-slate-500 uppercase">Total de Envios</p>
                    <p className="text-2xl font-bold">{stats.totalSent.toLocaleString()}</p>
                  </div>
                  <Send className="h-8 w-8 text-blue-100 dark:text-blue-900/30" />
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-slate-900 border-l-4 border-l-amber-500">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-xs font-medium text-slate-500 uppercase">Mensagens Respondidas</p>
                    <p className="text-2xl font-bold">{stats.responded.toLocaleString()}</p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-amber-100 dark:text-amber-900/30" />
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-slate-900 border-l-4 border-l-green-500">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-xs font-medium text-slate-500 uppercase">Previsão de Pagamentos</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.paid.toLocaleString()}</p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-green-100 dark:text-green-900/30" />
                </CardContent>
              </Card>
            </div>

            <Card className="bg-slate-50 dark:bg-slate-800/50 border-dashed">
              <CardContent className="p-4">
                <p className="text-xs text-slate-500 italic">
                  * Os cálculos são baseados em médias de conversão de mercado para o setor de cobranças e podem variar de acordo com a qualidade da base de contatos.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
