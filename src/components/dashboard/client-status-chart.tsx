import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, Sector } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { parseISO, isBefore, differenceInDays } from "date-fns";
import { useState } from "react";

interface ClientStatusChartProps {
  clients: any[];
}

export function ClientStatusChart({ clients }: ClientStatusChartProps) {
  const [activeIndex, setActiveIndex] = useState(-1);

  const data = useMemo(() => {
    let paid = 0;
    let pending = 0;
    let overdue = 0;

    const today = new Date();

    clients.forEach(client => {
      if (client.status === "pago") {
        paid++;
      } else if (client.status === "atrasado") {
        overdue++;
      } else {
        // Se status for pendente, mas a data já passou, conta como vencido
        if (client.due_date) {
          const dueDate = parseISO(client.due_date);
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

  const renderActiveShape = (props: any) => {
    const RADIAN = Math.PI / 180;
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
      <g>
        <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} className="font-bold text-lg">
          {payload.name}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="currentColor" className="text-xs font-bold">
          {`${value} Clientes`}
        </text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#94a3b8" className="text-[10px]">
          {`(${(percent * 100).toFixed(1)}%)`}
        </text>
      </g>
    );
  };

  return (
    <Card className="h-full border-none shadow-lg bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold tracking-tight">Monitoramento</CardTitle>
            <CardDescription className="text-xs italic">Visão geral das cobranças</CardDescription>
          </div>
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" title="Tempo Real" />
        </div>
      </CardHeader>
      <CardContent className="h-[320px] p-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              data={data}
              cx="50%"
              cy="45%"
              innerRadius={65}
              outerRadius={85}
              paddingAngle={8}
              dataKey="value"
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(-1)}
              animationBegin={0}
              animationDuration={800}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color} 
                  stroke="none"
                  style={{ filter: activeIndex === index ? `drop-shadow(0 0 8px ${entry.color}80)` : 'none' }}
                />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                borderRadius: '12px', 
                border: 'none', 
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(4px)'
              }}
              itemStyle={{ fontWeight: 'bold' }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={40}
              iconType="circle"
              formatter={(value) => <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
