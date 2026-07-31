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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useApp } from "@/store/app-store";
import { formatDate, iso, BASE_DATE } from "@/data/mock";
import type { AppUser } from "@/data/types";
import { Plus, Search } from "lucide-react";

export const Route = createFileRoute("/admin/managers")({
  head: () => ({
    meta: [
      { title: "Mess Managers | FoodPulse Admin" },
      { name: "description", content: "Add, edit and manage mess manager accounts and their assigned mess." },
      { property: "og:title", content: "Mess Managers | FoodPulse Admin" },
      { property: "og:description", content: "Add, edit and manage mess manager accounts and their assigned mess." },
    ],
  }),
  component: AdminManagersPage,
});

const emptyManager: AppUser = {
  id: "",
  name: "",
  email: "",
  contact: "",
  role: "manager",
  status: "Active",
  joinedDate: iso(BASE_DATE),
  assignedMess: "",
};

function AdminManagersPage() {
  const { users, upsertUser, toggleUserStatus, logAction } = useApp();
  const loading = useSimulatedLoad();
  const [search, setSearch] = useState("");
  const managers = useMemo(() => users.filter((u) => u.role === "manager"), [users]);
  const filtered = useMemo(
    () =>
      managers.filter(
        (m) =>
          !search ||
          m.name.toLowerCase().includes(search.toLowerCase()) ||
          (m.assignedMess ?? "").toLowerCase().includes(search.toLowerCase()),
      ),
    [managers, search],
  );

  const [addOpen, setAddOpen] = useState(false);
  const [editManager, setEditManager] = useState<AppUser | null>(null);
  const [form, setForm] = useState<AppUser>(emptyManager);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmManager, setConfirmManager] = useState<AppUser | null>(null);

  function openAdd() {
    setForm({ ...emptyManager, id: `MGR-${String(managers.length + 1).padStart(3, "0")}`, joinedDate: iso(BASE_DATE) });
    setErrors({});
    setAddOpen(true);
  }

  function validate(m: AppUser) {
    const e: Record<string, string> = {};
    if (!m.name.trim()) e.name = "Name is required";
    if (!/^\S+@\S+\.\S+$/.test(m.email)) e.email = "Enter a valid email";
    if (!m.contact.trim()) e.contact = "Phone number is required";
    if (!m.assignedMess?.trim()) e.assignedMess = "Assigned mess is required";
    return e;
  }

  function saveNew() {
    const e = validate(form);
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    upsertUser(form);
    logAction({ user: "Ravi Krishnan (Admin)", action: "Added mess manager", module: "Mess Managers", description: `${form.name} assigned to ${form.assignedMess}`, status: "Success" });
    toast.success(`${form.name} added as mess manager`);
    setAddOpen(false);
  }

  function saveEdit() {
    if (!editManager) return;
    const e = validate(editManager);
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    upsertUser(editManager);
    logAction({ user: "Ravi Krishnan (Admin)", action: "Updated mess manager", module: "Mess Managers", description: `${editManager.name} details updated`, status: "Success" });
    toast.success("Manager details updated");
    setEditManager(null);
  }

  function confirmToggle() {
    if (!confirmManager) return;
    toggleUserStatus(confirmManager.id);
    const newStatus = confirmManager.status === "Active" ? "Inactive" : "Active";
    logAction({
      user: "Ravi Krishnan (Admin)",
      action: newStatus === "Inactive" ? "Deactivated mess manager" : "Activated mess manager",
      module: "Mess Managers",
      description: `${confirmManager.name} ${newStatus === "Inactive" ? "deactivated" : "activated"}`,
      status: "Success",
    });
    toast.success(`${confirmManager.name} ${newStatus === "Inactive" ? "deactivated" : "activated"}`);
    setConfirmManager(null);
  }

  return (
    <div>
      <PageHeader
        title="Mess Managers"
        description="Manage mess manager accounts and their assigned mess locations."
        actions={
          <Button onClick={openAdd}>
            <Plus className="mr-1.5 size-4" /> Add Manager
          </Button>
        }
      />

      <SectionCard>
        <div className="mb-4 relative">
          <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
          <Input placeholder="Search by name or mess…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 sm:max-w-sm" aria-label="Search managers" />
        </div>

        {loading ? (
          <TableSkeleton rows={4} cols={6} />
        ) : filtered.length === 0 ? (
          <EmptyState title="No mess managers found" description="Try adjusting your search, or add a new manager." />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Assigned Mess</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.name}</TableCell>
                    <TableCell className="text-muted-foreground">{m.email}</TableCell>
                    <TableCell>{m.contact}</TableCell>
                    <TableCell>{m.assignedMess ?? "—"}</TableCell>
                    <TableCell><StatusBadge status={m.status} /></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => setEditManager(m)}>Edit</Button>
                        <Button
                          variant={m.status === "Active" ? "destructive" : "default"}
                          size="sm"
                          onClick={() => setConfirmManager(m)}
                        >
                          {m.status === "Active" ? "Deactivate" : "Activate"}
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

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Mess Manager</DialogTitle>
            <DialogDescription>Create a new manager account and assign a mess.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="m-name">Name</Label>
              <Input id="m-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} aria-invalid={!!errors.name} />
              {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
            </div>
            <div>
              <Label htmlFor="m-email">Email</Label>
              <Input id="m-email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} aria-invalid={!!errors.email} />
              {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
            </div>
            <div>
              <Label htmlFor="m-phone">Phone</Label>
              <Input id="m-phone" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} aria-invalid={!!errors.contact} />
              {errors.contact && <p className="mt-1 text-xs text-destructive">{errors.contact}</p>}
            </div>
            <div>
              <Label htmlFor="m-mess">Assigned Mess</Label>
              <Input id="m-mess" value={form.assignedMess ?? ""} onChange={(e) => setForm({ ...form, assignedMess: e.target.value })} aria-invalid={!!errors.assignedMess} />
              {errors.assignedMess && <p className="mt-1 text-xs text-destructive">{errors.assignedMess}</p>}
            </div>
            <div>
              <Label htmlFor="m-status">Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as AppUser["status"] })}>
                <SelectTrigger id="m-status"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={saveNew}>Add manager</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editManager} onOpenChange={(o) => !o && setEditManager(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Mess Manager</DialogTitle>
            <DialogDescription>Update details for {editManager?.name}.</DialogDescription>
          </DialogHeader>
          {editManager && (
            <div className="space-y-3">
              <div>
                <Label htmlFor="em-name">Name</Label>
                <Input id="em-name" value={editManager.name} onChange={(e) => setEditManager({ ...editManager, name: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="em-email">Email</Label>
                <Input id="em-email" value={editManager.email} onChange={(e) => setEditManager({ ...editManager, email: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="em-phone">Phone</Label>
                <Input id="em-phone" value={editManager.contact} onChange={(e) => setEditManager({ ...editManager, contact: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="em-mess">Assigned Mess</Label>
                <Input id="em-mess" value={editManager.assignedMess ?? ""} onChange={(e) => setEditManager({ ...editManager, assignedMess: e.target.value })} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditManager(null)}>Cancel</Button>
            <Button onClick={saveEdit}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!confirmManager}
        onOpenChange={(o) => !o && setConfirmManager(null)}
        title={confirmManager?.status === "Active" ? "Deactivate manager?" : "Activate manager?"}
        description={`This will ${confirmManager?.status === "Active" ? "deactivate" : "activate"} ${confirmManager?.name}'s account.`}
        confirmLabel={confirmManager?.status === "Active" ? "Deactivate" : "Activate"}
        destructive={confirmManager?.status === "Active"}
        onConfirm={confirmToggle}
      />
    </div>
  );
}
