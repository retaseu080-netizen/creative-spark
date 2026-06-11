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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../components/ui/select";
import { UserPlus, Shield, UserCircle, Edit, Trash2, Circle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "../lib/utils";
import { supabase } from "@/integrations/supabase/client";

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

function UsersComponent() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<TeamUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<TeamUser | null>(null);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [statuses, setStatuses] = useState<Record<string, { status: string }>>({});
  
  // Form states
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "operator">("operator");
  const [newPhone, setNewPhone] = useState("");

  const fetchUsers = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      setUsers(data as any[]);
    } catch (err: any) {
      toast.error("Erro ao carregar usuários: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      if (user.role !== "admin") {
        navigate({ to: "/" });
      } else {
        fetchUsers();
      }
    }
  }, [user, navigate]);

  useEffect(() => {
    const updateStatuses = () => {
      const saved = JSON.parse(localStorage.getItem("operator_statuses") || "{}");
      setStatuses(saved);
    };

    updateStatuses();
    const interval = setInterval(updateStatuses, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (editingUser) {
      setNewName(editingUser.name);
      setNewEmail(editingUser.email);
      setNewRole(editingUser.role);
      setNewPhone(editingUser.phone);
      setNewPassword("");
    } else {
      setNewName("");
      setNewEmail("");
      setNewRole("operator");
      setNewPhone("");
      setNewPassword("");
    }
  }, [editingUser]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      if (editingUser) {
        const { error } = await supabase
          .from('team_members')
          .update({
            name: newName,
            email: newEmail,
            role: newRole,
            phone: newPhone
          })
          .eq('id', editingUser.id);

        if (error) throw error;
        toast.success("Usuário atualizado com sucesso!");
      } else {
        // Para criar um novo usuário que possa logar, idealmente usaríamos uma Edge Function.
        // Por enquanto, apenas registramos na tabela de membros.
        const { error } = await supabase
          .from('team_members')
          .insert({
            resale_id: user.id,
            name: newName,
            email: newEmail,
            role: newRole,
            phone: newPhone
          });

        if (error) throw error;
        toast.success("Usuário adicionado à equipe!");
      }
      setIsOpen(false);
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      toast.error("Erro ao salvar usuário: " + err.message);
    }
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', userToDelete);

      if (error) throw error;
      toast.success("Usuário removido.");
      fetchUsers();
    } catch (err: any) {
      toast.error("Erro ao remover usuário: " + err.message);
    } finally {
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  if (user?.role !== "admin") return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Gerenciar Equipe</h1>
            <p className="text-slate-500">Controle o acesso e os níveis de permissão dos colaboradores.</p>
          </div>
          
          <Dialog open={isOpen} onOpenChange={(val) => {
            setIsOpen(val);
            if (!val) setEditingUser(null);
          }}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" /> Adicionar Usuário
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingUser ? "Editar Usuário" : "Novo Integrante"}</DialogTitle>
                <DialogDescription>
                  Preencha os dados abaixo para {editingUser ? "atualizar" : "criar"} o acesso.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input id="name" required value={newName} onChange={e => setNewName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" required value={newEmail} onChange={e => setNewEmail(e.target.value)} />
                </div>
                {!editingUser && (
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input id="password" type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                  </div>
                )}
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
                <DialogFooter className="pt-4 gap-2 sm:gap-0">
                  <Button type="submit" className="flex-1">
                    {editingUser ? "Salvar Alterações" : newRole === "admin" ? "Adicionar Admin" : "Adicionar Operador"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-red-600" />
              <p className="text-slate-500 text-sm">Carregando usuários...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                  <TableHead>Status</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Nível</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                      Nenhum usuário encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((u) => {
                    const isOnline = statuses[u.id]?.status === "online";
                    return (
                      <TableRow key={u.id} className="dark:border-slate-800">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Circle className={cn("h-3 w-3 fill-current", isOnline ? "text-green-500" : "text-slate-300")} />
                            <span className="text-xs font-medium">{isOnline ? "Online" : "Offline"}</span>
                          </div>
                        </TableCell>
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
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => {
                              setEditingUser(u);
                              setIsOpen(true);
                            }}>
                              <Edit className="h-4 w-4 text-slate-500" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => {
                              setUserToDelete(u.id);
                              setIsDeleteDialogOpen(true);
                            }}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}
        </div>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Deseja excluir este operador?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. O acesso deste colaborador será removido permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setUserToDelete(null)}>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Confirmar Exclusão
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
