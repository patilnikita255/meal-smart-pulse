import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader, SectionCard } from "@/components/fp/page-header";
import { StatusBadge } from "@/components/fp/status-badge";
import { ConfirmDialog } from "@/components/fp/confirm-dialog";
import { EmptyState, TableSkeleton, useSimulatedLoad } from "@/components/fp/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useApp } from "@/store/app-store";
import { formatDate, iso, BASE_DATE } from "@/data/mock";
import type { AppUser, Role } from "@/data/types";
import { Plus, Search } from "lucide-react";

export const Route = createFileRoute("/admin/users")({
  head: () => ({
    meta: [
      { title: "User Management | FoodPulse Admin" },
      { name: "description", content: "View, add, edit and manage the status of all FoodPulse users." },
      { property: "og:title", content: "User Management | FoodPulse Admin" },
      { property: "og:description", content: "View, add, edit and manage the status of all FoodPulse users." },
    ],
  }),
  component: AdminUsersPage,
});

const emptyUser: AppUser = {
  id: "",
  name: "",
  email: "",
  contact: "",
  role: "student",
  status: "Active",
  joinedDate: iso(BASE_DATE),
};

function AdminUsersPage() {
  const { users, upsertUser, toggleUserStatus, logAction } = useApp();
  const loading = useSimulatedLoad();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | Role>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "Active" | "Inactive">("all");

  const [viewUser, setViewUser] = useState<AppUser | null>(null);
  const [editUser, setEditUser] = useState<AppUser | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState<AppUser>(emptyUser);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmUser, setConfirmUser] = useState<AppUser | null>(null);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        !search ||
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      const matchesStatus = statusFilter === "all" || u.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  function openAdd() {
    setForm({ ...emptyUser, id: `STU-${String(users.length + 1).padStart(3, "0")}`, joinedDate: iso(BASE_DATE) });
    setErrors({});
    setAddOpen(true);
  }

  function validate(u: AppUser) {
    const e: Record<string, string> = {};
    if (!u.name.trim()) e.name = "Name is required";
    if (!/^\S+@\S+\.\S+$/.test(u.email)) e.email = "Enter a valid email";
    if (!u.contact.trim()) e.contact = "Contact number is required";
    return e;
  }

  function saveNewUser() {
    const e = validate(form);
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    upsertUser(form);
    logAction({ user: "Ravi Krishnan (Admin)", action: "Added user", module: "Users", description: `${form.name} (${form.id}) added as ${form.role}`, status: "Success" });
    toast.success(`${form.name} added successfully`);
    setAddOpen(false);
  }

  function saveEdit() {
    if (!editUser) return;
    const e = validate(editUser);
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    upsertUser(editUser);
    logAction({ user: "Ravi Krishnan (Admin)", action: "Updated user", module: "Users", description: `${editUser.name} (${editUser.id}) details updated`, status: "Success" });
    toast.success("User details updated");
    setEditUser(null);
  }

  function confirmToggle() {
    if (!confirmUser) return;
    toggleUserStatus(confirmUser.id);
    const newStatus = confirmUser.status === "Active" ? "Inactive" : "Active";
    logAction({
      user: "Ravi Krishnan (Admin)",
      action: newStatus === "Inactive" ? "Deactivated user" : "Activated user",
      module: "Users",
      description: `${confirmUser.name} (${confirmUser.id}) ${newStatus === "Inactive" ? "deactivated" : "activated"}`,
      status: "Success",
    });
    toast.success(`${confirmUser.name} ${newStatus === "Inactive" ? "deactivated" : "activated"}`);
    setConfirmUser(null);
  }

  return (
    <div>
      <PageHeader
        title="User Management"
        description="Manage all student and system accounts across FoodPulse."
        actions={
          <Button onClick={openAdd}>
            <Plus className="mr-1.5 size-4" /> Add User
          </Button>
        }
      />

      <SectionCard>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              aria-label="Search users"
            />
          </div>
          <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as typeof roleFilter)}>
            <SelectTrigger className="w-full sm:w-40" aria-label="Filter by role">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              <SelectItem value="student">Student</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
            <SelectTrigger className="w-full sm:w-40" aria-label="Filter by status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <TableSkeleton rows={6} cols={7} />
        ) : filtered.length === 0 ? (
          <EmptyState title="No users found" description="Try adjusting your search or filters." />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell className="text-muted-foreground">{u.email}</TableCell>
                    <TableCell>{u.contact}</TableCell>
                    <TableCell className="capitalize">{u.role}</TableCell>
                    <TableCell>
                      <StatusBadge status={u.status} />
                    </TableCell>
                    <TableCell>{formatDate(u.joinedDate)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => setViewUser(u)}>
                          View
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setEditUser(u)}>
                          Edit
                        </Button>
                        <Button
                          variant={u.status === "Active" ? "destructive" : "default"}
                          size="sm"
                          onClick={() => setConfirmUser(u)}
                        >
                          {u.status === "Active" ? "Deactivate" : "Activate"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </SectionCard>

      {/* View dialog */}
      <Dialog open={!!viewUser} onOpenChange={(o) => !o && setViewUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{viewUser?.name}</DialogTitle>
            <DialogDescription>User account details</DialogDescription>
          </DialogHeader>
          {viewUser && (
            <div className="space-y-2 text-sm">
              <p><span className="text-muted-foreground">ID:</span> {viewUser.id}</p>
              <p><span className="text-muted-foreground">Email:</span> {viewUser.email}</p>
              <p><span className="text-muted-foreground">Contact:</span> {viewUser.contact}</p>
              <p><span className="text-muted-foreground">Role:</span> <span className="capitalize">{viewUser.role}</span></p>
              <p><span className="text-muted-foreground">Status:</span> <StatusBadge status={viewUser.status} /></p>
              <p><span className="text-muted-foreground">Joined:</span> {formatDate(viewUser.joinedDate)}</p>
              {viewUser.assignedMess && <p><span className="text-muted-foreground">Assigned Mess:</span> {viewUser.assignedMess}</p>}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editUser} onOpenChange={(o) => !o && setEditUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update account information for {editUser?.name}.</DialogDescription>
          </DialogHeader>
          {editUser && (
            <div className="space-y-3">
              <div>
                <Label htmlFor="edit-name">Name</Label>
                <Input id="edit-name" value={editUser.name} onChange={(e) => setEditUser({ ...editUser, name: e.target.value })} aria-invalid={!!errors.name} />
              </div>
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input id="edit-email" value={editUser.email} onChange={(e) => setEditUser({ ...editUser, email: e.target.value })} aria-invalid={!!errors.email} />
              </div>
              <div>
                <Label htmlFor="edit-contact">Contact</Label>
                <Input id="edit-contact" value={editUser.contact} onChange={(e) => setEditUser({ ...editUser, contact: e.target.value })} aria-invalid={!!errors.contact} />
              </div>
              <div>
                <Label htmlFor="edit-role">Role</Label>
                <Select value={editUser.role} onValueChange={(v) => setEditUser({ ...editUser, role: v as Role })}>
                  <SelectTrigger id="edit-role"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)}>Cancel</Button>
            <Button onClick={saveEdit}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add User</DialogTitle>
            <DialogDescription>Create a new account.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="add-name">Name</Label>
              <Input id="add-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} aria-invalid={!!errors.name} />
              {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
            </div>
            <div>
              <Label htmlFor="add-email">Email</Label>
              <Input id="add-email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} aria-invalid={!!errors.email} />
              {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
            </div>
            <div>
              <Label htmlFor="add-contact">Contact</Label>
              <Input id="add-contact" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} aria-invalid={!!errors.contact} />
              {errors.contact && <p className="mt-1 text-xs text-destructive">{errors.contact}</p>}
            </div>
            <div>
              <Label htmlFor="add-role">Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as Role })}>
                <SelectTrigger id="add-role"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={saveNewUser}>Add user</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!confirmUser}
        onOpenChange={(o) => !o && setConfirmUser(null)}
        title={confirmUser?.status === "Active" ? "Deactivate user?" : "Activate user?"}
        description={`This will ${confirmUser?.status === "Active" ? "deactivate" : "activate"} ${confirmUser?.name}'s account.`}
        confirmLabel={confirmUser?.status === "Active" ? "Deactivate" : "Activate"}
        destructive={confirmUser?.status === "Active"}
        onConfirm={confirmToggle}
      />
    </div>
  );
}
