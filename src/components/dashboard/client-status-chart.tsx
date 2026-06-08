import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { parse, isBefore, isAfter, subDays, differenceInDays } from "date-fns";

interface ClientStatusChartProps {
  clients: any[];
}

export function ClientStatusChart({ clients }: ClientStatusChartProps) {
  const data = useMemo(() => {
    let paid = 0;
    let pending = 0;
    let overdue = 0;

    const today = new Date();

    clients.forEach(client => {
      if (client.status === "Pago") {
        paid++;
      } else {
        // Lógica de Vencimento
        if (client.dueDate) {
          const dueDate = parse(client.dueDate, "dd/MM/yyyy", new Date());
          
          if (isBefore(dueDate, today) && differenceInDays(today, dueDate) > 0) {
            overdue++;
          } else {
            pending++;
          }
        } else {
          pending++;
        }
      }
    });

    return [
      { name: "Pagos", value: paid, color: "#22c55e" }, // Verde
      { name: "Pendentes", value: pending, color: "#f97316" }, // Laranja
      { name: "Vencidos", value: overdue, color: "#ef4444" }, // Vermelho
    ].filter(d => d.value > 0);
  }, [clients]);

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold">Status dos Clientes</CardTitle>
        <CardDescription>Divisão proporcional em tempo real</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
            <Legend verticalAlign="bottom" height={36}/>
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
