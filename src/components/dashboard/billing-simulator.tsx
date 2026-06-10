import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Calculator, MessageSquare, TrendingUp, Users, DollarSign } from "lucide-react";
import { Slider } from "../ui/slider";
import { cn } from "../../lib/utils";

export function BillingSimulator() {
  const [value, setValue] = useState(150);
  const [clients, setClients] = useState(100);
  const [conversion, setConversion] = useState(80);
  const [projected, setProjected] = useState(0);

  useEffect(() => {
    const result = value * clients * (conversion / 100);
    setProjected(result);
  }, [value, clients, conversion]);

  return (
    <Card className="border-none shadow-xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <MessageSquare className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold tracking-tight">Simulador WhatsApp Business</CardTitle>
            <CardDescription className="text-sm">
              Projete o impacto financeiro dos seus disparos de cobrança automatizados.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-slate-400" />
                  Ticket Médio (R$)
                </Label>
                <span className="text-sm font-bold text-primary bg-primary/5 px-2 py-0.5 rounded">
                  R$ {value}
                </span>
              </div>
              <Slider 
                value={[value]} 
                onValueChange={(v) => setValue(v[0])} 
                max={2000} 
                step={10}
                className="py-2"
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4 text-slate-400" />
                  Base de Clientes
                </Label>
                <span className="text-sm font-bold text-primary bg-primary/5 px-2 py-0.5 rounded">
                  {clients} Ativos
                </span>
              </div>
              <Slider 
                value={[clients]} 
                onValueChange={(v) => setClients(v[0])} 
                max={5000} 
                step={50}
                className="py-2"
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-slate-400" />
                  Taxa de Recuperação (%)
                </Label>
                <span className="text-sm font-bold text-primary bg-primary/5 px-2 py-0.5 rounded">
                  {conversion}%
                </span>
              </div>
              <Slider 
                value={[conversion]} 
                onValueChange={(v) => setConversion(v[0])} 
                max={100} 
                step={1}
                className="py-2"
              />
            </div>
          </div>

          <div className="flex flex-col justify-center items-center p-8 rounded-2xl bg-primary text-primary-foreground shadow-2xl shadow-primary/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
              <Calculator className="h-24 w-24" />
            </div>
            
            <span className="text-primary-foreground/70 text-sm font-medium uppercase tracking-widest mb-2">
              Recuperação Estimada
            </span>
            <div className="text-4xl md:text-5xl font-black mb-4 tracking-tighter">
              {projected.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
            
            <div className="flex flex-col items-center gap-1 mt-4">
              <div className="flex items-center gap-2 text-xs font-bold bg-white/20 px-3 py-1 rounded-full backdrop-blur-md">
                <TrendingUp className="h-3 w-3" />
                Impacto Mensal Projetado
              </div>
              <p className="text-[10px] text-white/50 mt-2 text-center max-w-[200px]">
                Baseado na eficiência histórica de cobrança via API WhatsApp Business.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

