import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { ChevronDown, ChevronUp, Tag } from "lucide-react";
import { cn } from "../../lib/utils";

const categories = [
  { id: "1", name: "Serviços de TI", count: 12 },
  { id: "2", name: "Consultoria", count: 5 },
  { id: "3", name: "Licenciamento", count: 8 },
  { id: "4", name: "Manutenção", count: 15 },
  { id: "5", name: "Treinamentos", count: 3 },
];

export function CategorySection() {
  const [showCategories, setShowCategories] = useState(false);

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="space-y-1">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Tag className="h-5 w-5 text-primary" />
            Categorias de Cobrança
          </CardTitle>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowCategories(!showCategories)}
          className="flex items-center gap-2"
        >
          {showCategories ? (
            <>
              Esconder Categorias <ChevronUp className="h-4 w-4" />
            </>
          ) : (
            <>
              Ver Categorias <ChevronDown className="h-4 w-4" />
            </>
          )}
        </Button>
      </CardHeader>
      
      <div className={cn(
        "overflow-hidden transition-all duration-300 ease-in-out",
        showCategories ? "max-h-96 opacity-100 pb-6 px-6" : "max-h-0 opacity-0"
      )}>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {categories.map((cat) => (
            <div 
              key={cat.id} 
              className="flex flex-col items-center justify-center p-3 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors"
            >
              <span className="text-sm font-medium text-slate-700">{cat.name}</span>
              <Badge variant="secondary" className="mt-1.5 bg-white text-[10px]">
                {cat.count} cobranças
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
