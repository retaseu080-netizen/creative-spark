import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Calculator } from "lucide-react";

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
    <Card className="max-w-3xl mx-auto shadow-sm">
      <CardHeader className="p-3 pb-0">
        <CardTitle className="flex items-center gap-1.5 text-sm font-bold">
          <Calculator className="h-3.5 w-3.5 text-primary" />
          Simulador de Lucro
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-2">
        <div className="grid gap-3 grid-cols-2 md:grid-cols-4 items-end">
          <div className="space-y-1">
            <Label htmlFor="sim-value" className="text-[10px] uppercase font-bold text-slate-500">Valor (R$)</Label>
            <Input 
              id="sim-value" 
              type="number" 
              className="h-7 text-xs px-2"
              value={value} 
              onChange={e => setValue(Number(e.target.value))} 
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="sim-clients" className="text-[10px] uppercase font-bold text-slate-500">Clientes</Label>
            <Input 
              id="sim-clients" 
              type="number" 
              className="h-7 text-xs px-2"
              value={clients} 
              onChange={e => setClients(Number(e.target.value))} 
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="sim-conv" className="text-[10px] uppercase font-bold text-slate-500">Conversão (%)</Label>
            <Input 
              id="sim-conv" 
              type="number" 
              className="h-7 text-xs px-2"
              value={conversion} 
              onChange={e => setConversion(Number(e.target.value))} 
            />
          </div>
          <div className="px-3 py-1.5 bg-primary/5 border border-primary/10 rounded-md">
            <Label className="text-[9px] uppercase text-primary/70 font-black">Lucro Projetado</Label>
            <div className="text-sm font-bold text-primary">
              {projected.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

