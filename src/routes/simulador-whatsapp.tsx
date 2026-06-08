import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "../components/layout/dashboard-layout";
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { MessageSquare, Send, CheckCircle2, MessageCircle, MoreVertical, Phone, Video, CheckCheck } from "lucide-react";

export const Route = createFileRoute("/simulador-whatsapp")({
  component: WhatsAppSimulatorComponent,
});

function WhatsAppSimulatorComponent() {
  const [contacts, setContacts] = useState(500);
  const [message, setMessage] = useState("Olá, identificamos um pagamento pendente em seu nome. Regularize agora para evitar suspensão do serviço!");
  const [returnRate, setReturnRate] = useState(15);

  const stats = useMemo(() => {
    const totalSent = contacts;
    const responded = Math.floor(contacts * (returnRate / 100));
    const paid = Math.floor(responded * 0.4); 

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

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Entradas */}
          <div className="space-y-6">
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="bg-white dark:bg-slate-900 border-l-4 border-l-blue-500">
                <CardContent className="p-4 py-3">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Envios</p>
                  <p className="text-xl font-bold">{stats.totalSent.toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-slate-900 border-l-4 border-l-amber-500">
                <CardContent className="p-4 py-3">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Respostas</p>
                  <p className="text-xl font-bold">{stats.responded.toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-slate-900 border-l-4 border-l-green-500">
                <CardContent className="p-4 py-3">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Pagos</p>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">{stats.paid.toLocaleString()}</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Prévia Visual WhatsApp */}
          <div className="flex flex-col h-full">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2 px-1">Prévia do Disparo</h3>
            <div className="flex-1 min-h-[500px] rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col shadow-xl bg-[#e5ddd5] dark:bg-slate-950">
              {/* Header do WhatsApp */}
              <div className="bg-[#075e54] dark:bg-[#128c7e] p-3 flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-slate-200 flex-shrink-0 overflow-hidden">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Cobrança" alt="Perfil" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Cobrança Oficial</p>
                    <p className="text-[10px] opacity-80">Online agora</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 opacity-90">
                  <Video className="h-4 w-4" />
                  <Phone className="h-4 w-4" />
                  <MoreVertical className="h-4 w-4" />
                </div>
              </div>

              {/* Chat Area */}
              <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat opacity-95 dark:opacity-10 dark:bg-none">
                <div className="flex justify-center">
                  <span className="bg-[#dcf8c6]/80 dark:bg-slate-800 text-[10px] px-2 py-1 rounded-md text-slate-600 dark:text-slate-400 font-medium uppercase">Hoje</span>
                </div>

                <div className="flex justify-end">
                  <div className="max-w-[85%] bg-[#dcf8c6] dark:bg-[#056162] rounded-lg rounded-tr-none p-3 shadow-sm relative group">
                    <p className="text-sm text-slate-800 dark:text-white whitespace-pre-wrap leading-relaxed pr-8">
                      {message || "Sua mensagem aparecerá aqui..."}
                    </p>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span className="text-[10px] text-slate-500 dark:text-slate-300">14:30</span>
                      <CheckCheck className="h-3 w-3 text-blue-500" />
                    </div>

                    {/* Botões do Disparo */}
                    <div className="mt-3 space-y-2 pt-2 border-t border-slate-200/50 dark:border-white/10">
                      <button className="w-full bg-white dark:bg-[#128c7e] text-blue-500 dark:text-white py-2 rounded-md text-xs font-bold shadow-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors">
                        <MessageSquare className="h-3.5 w-3.5" /> Ver Fatura
                      </button>
                      <button className="w-full bg-white dark:bg-[#128c7e] text-blue-500 dark:text-white py-2 rounded-md text-xs font-bold shadow-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Pagar via Pix
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Input Area do WhatsApp (Fictícia) */}
              <div className="bg-[#f0f2f5] dark:bg-[#202c33] p-2 flex items-center gap-2">
                <div className="flex-1 bg-white dark:bg-[#2a3942] rounded-lg h-9"></div>
                <div className="h-10 w-10 rounded-full bg-[#128c7e] flex items-center justify-center text-white">
                  <Send className="h-5 w-5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

