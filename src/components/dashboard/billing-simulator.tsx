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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          Simulador de Cobranças
        </CardTitle>
        <CardDescription>
          Estime seu lucro projetado com base em cenários.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-4 items-end">
          <div className="space-y-2">
            <Label htmlFor="sim-value">Valor da Cobrança (R$)</Label>
            <Input 
              id="sim-value" 
              type="number" 
              value={value} 
              onChange={e => setValue(Number(e.target.value))} 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sim-clients">Qtd. de Clientes</Label>
            <Input 
              id="sim-clients" 
              type="number" 
              value={clients} 
              onChange={e => setClients(Number(e.target.value))} 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sim-conv">Taxa de Conversão (%)</Label>
            <Input 
              id="sim-conv" 
              type="number" 
              value={conversion} 
              onChange={e => setConversion(Number(e.target.value))} 
            />
          </div>
          <div className="p-4 bg-primary/5 border border-primary/10 rounded-lg">
            <Label className="text-xs uppercase text-primary/60 font-bold">Lucro Projetado</Label>
            <div className="text-2xl font-bold text-primary">
              {projected.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
