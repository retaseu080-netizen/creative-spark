import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { DashboardLayout } from "../components/layout/dashboard-layout";
import { useAuth } from "../hooks/use-auth";
import { useEffect, useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../components/ui/table";
import { Button } from "../components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../components/ui/select";
import { UserPlus, Shield, UserCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/usuarios")({
  component: UsersComponent,
});

interface TeamUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "operator";
  phone: string;
}

const initialUsers: TeamUser[] = [
  { id: "1", name: "Admin Global", email: "admin@sistema.com", role: "admin", phone: "(11) 99999-9999" },
  { id: "2", name: "Operador Padrão", email: "operador@sistema.com", role: "operator", phone: "(11) 98888-8888" },
];

function UsersComponent() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<TeamUser[]>(initialUsers);
  const [isOpen, setIsOpen] = useState(false);
  
  // Form states
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "operator">("operator");
  const [newPhone, setNewPhone] = useState("");

  // RBAC Check
  useEffect(() => {
    if (user && user.role !== "admin") {
      navigate({ to: "/" });
    }
  }, [user, navigate]);

  // Mask function for Brazilian phone
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      return numbers
        .replace(/^(\d{2})(\d)/g, "($1) $2")
        .replace(/(\d{5})(\d)/, "$1-$2")
        .substring(0, 15);
    }
    return value.substring(0, 15);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPhone(formatPhone(e.target.value));
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: TeamUser = {
      id: Math.random().toString(36).substr(2, 9),
      name: newName,
      email: newEmail,
      role: newRole,
      phone: newPhone
    };
    
    setUsers([...users, newUser]);
    setIsOpen(false);
    toast.success("Usuário adicionado com sucesso!");
    
    // Reset fields
    setNewName("");
    setNewEmail("");
    setNewPassword("");
    setNewPhone("");
  };

  if (user?.role !== "admin") return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Gerenciar Equipe</h1>
            <p className="text-slate-500">Controle o acesso e os níveis de permissão dos colaboradores.</p>
          </div>
          
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" /> Adicionar Usuário
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Novo Integrante</DialogTitle>
                <DialogDescription>
                  Preencha os dados abaixo para criar o acesso.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddUser} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input id="name" required value={newName} onChange={e => setNewName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" required value={newEmail} onChange={e => setNewEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input id="password" type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Nível de Acesso</Label>
                  <Select value={newRole} onValueChange={(val: any) => setNewRole(val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o nível" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="operator">Operador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input 
                    id="phone" 
                    placeholder="(99) 99999-9999" 
                    required 
                    value={newPhone} 
                    onChange={handlePhoneChange} 
                  />
                </div>
                <DialogFooter className="pt-4">
                  <Button type="submit" className="w-full">Cadastrar Usuário</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-md border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Nível</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.phone}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      {u.role === "admin" ? (
                        <Shield className="h-3.5 w-3.5 text-indigo-600" />
                      ) : (
                        <UserCircle className="h-3.5 w-3.5 text-slate-400" />
                      )}
                      <span className="capitalize">{u.role === "admin" ? "Administrador" : "Operador"}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
}
