import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Plus, Search } from "lucide-react";
import { PageHeader, SectionCard } from "@/components/fp/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/fp/status-badge";
import { ConfirmDialog } from "@/components/fp/confirm-dialog";
import { EmptyState, TableSkeleton, useSimulatedLoad } from "@/components/fp/states";
import { useApp } from "@/store/app-store";
import { formatDate } from "@/data/mock";
import type { MenuEntry } from "@/data/types";
import { MEAL_TYPES } from "@/data/types";

export const Route = createFileRoute("/manager/menu")({
  head: () => ({
    meta: [
      { title: "Menu Management — FoodPulse Mess Manager" },
      { name: "description", content: "Manage daily menus, mark special or festival meals, and deactivate outdated entries." },
      { property: "og:title", content: "Menu Management — FoodPulse Mess Manager" },
      { property: "og:description", content: "Add, edit and deactivate mess menus." },
    ],
  }),
  component: MenuManagement,
});

type FormState = {
  id: string | null;
  date: string;
  meal: MenuEntry["meal"];
  items: string;
  special: boolean;
  festival: boolean;
};

const emptyForm: FormState = { id: null, date: "", meal: "Breakfast", items: "", special: false, festival: false };

function MenuManagement() {
  const { menus, upsertMenu, deactivateMenu, logAction, currentUser } = useApp();
  const loading = useSimulatedLoad();
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return menus
      .filter((m) => (dateFilter ? m.date === dateFilter : true))
      .filter((m) =>
        search.trim()
          ? m.items.toLowerCase().includes(search.toLowerCase()) || m.meal.toLowerCase().includes(search.toLowerCase())
          : true,
      )
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [menus, search, dateFilter]);

  const openAdd = () => {
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (m: MenuEntry) => {
    setForm({ id: m.id, date: m.date, meal: m.meal, items: m.items, special: m.special, festival: m.festival });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.date || !form.items.trim()) {
      toast.error("Please fill in date and menu items");
      return;
    }
    const id = form.id ?? `MENU-${form.date}-${form.meal}`;
    upsertMenu({
      id,
      date: form.date,
      meal: form.meal,
      items: form.items.trim(),
      special: form.special,
      festival: form.festival,
      active: true,
    });
    logAction({
      user: `${currentUser?.name ?? "Manager"} (Manager)`,
      action: form.id ? "Updated menu" : "Added menu",
      module: "Menu",
      description: `${form.meal} ${formatDate(form.date)}: ${form.items.slice(0, 60)}`,
      status: "Success",
    });
    toast.success(form.id ? "Menu updated" : "Menu added");
    setDialogOpen(false);
  };

  const handleDeactivate = () => {
    if (!confirmId) return;
    deactivateMenu(confirmId);
    logAction({
      user: `${currentUser?.name ?? "Manager"} (Manager)`,
      action: "Deactivated menu",
      module: "Menu",
      description: `Menu entry ${confirmId} deactivated`,
      status: "Success",
    });
    toast.success("Menu entry deactivated");
    setConfirmId(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Menu Management"
        description="Plan daily menus and mark special or festival meals."
        breadcrumbs={[{ label: "Manager", to: "/manager" }, { label: "Menu Management" }]}
        actions={
          <Button onClick={openAdd}>
            <Plus className="mr-1.5 size-4" /> Add Menu
          </Button>
        }
      />

      <SectionCard
        title="Menu Entries"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
              <Input placeholder="Search items or meal…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-56 pl-8" aria-label="Search menu" />
            </div>
            <Input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="w-40" aria-label="Filter by date" />
          </div>
        }
        padded={false}
      >
        {loading ? (
          <TableSkeleton rows={6} cols={6} />
        ) : filtered.length === 0 ? (
          <EmptyState title="No menu entries found" description="Try adjusting your search or date filter." />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Meal</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Flags</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>{formatDate(m.date)}</TableCell>
                    <TableCell>{m.meal}</TableCell>
                    <TableCell className="max-w-xs truncate">{m.items}</TableCell>
                    <TableCell className="space-x-1">
                      {m.special && <StatusBadge status="Special" tone="primary" />}
                      {m.festival && <StatusBadge status="Festival" tone="warning" />}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={m.active ? "Active" : "Inactive"} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEdit(m)}>
                          Edit
                        </Button>
                        {m.active && (
                          <Button variant="outline" size="sm" onClick={() => setConfirmId(m.id)}>
                            Deactivate
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </SectionCard>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit Menu" : "Add Menu"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="menu-date">Date</Label>
                <Input id="menu-date" type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="menu-meal">Meal Type</Label>
                <Select value={form.meal} onValueChange={(v) => setForm((f) => ({ ...f, meal: v as MenuEntry["meal"] }))}>
                  <SelectTrigger id="menu-meal"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MEAL_TYPES.map((mt) => (
                      <SelectItem key={mt} value={mt}>{mt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="menu-items">Menu Items</Label>
              <Textarea id="menu-items" rows={3} value={form.items} onChange={(e) => setForm((f) => ({ ...f, items: e.target.value }))} placeholder="e.g. Idli, Sambar, Coconut Chutney, Filter Coffee" />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <Label htmlFor="menu-special">Special Meal</Label>
              <Switch id="menu-special" checked={form.special} onCheckedChange={(v) => setForm((f) => ({ ...f, special: v }))} />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <Label htmlFor="menu-festival">Festival Meal</Label>
              <Switch id="menu-festival" checked={form.festival} onCheckedChange={(v) => setForm((f) => ({ ...f, festival: v }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Menu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!confirmId}
        onOpenChange={(o) => !o && setConfirmId(null)}
        title="Deactivate menu entry?"
        description="This menu entry will no longer be shown to students as active."
        confirmLabel="Deactivate"
        destructive
        onConfirm={handleDeactivate}
      />
    </div>
  );
}
