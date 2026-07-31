import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader, SectionCard } from "@/components/fp/page-header";
import { StatusBadge } from "@/components/fp/status-badge";
import { ConfirmDialog } from "@/components/fp/confirm-dialog";
import { EmptyState, CardsSkeleton, useSimulatedLoad } from "@/components/fp/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useApp } from "@/store/app-store";
import { formatMoney } from "@/data/mock";
import { MEAL_TYPES, type MealType, type Plan } from "@/data/types";
import { Info, Plus } from "lucide-react";

export const Route = createFileRoute("/admin/plans")({
  head: () => ({
    meta: [
      { title: "Plan Management | FoodPulse Admin" },
      { name: "description", content: "Create, edit and deactivate mess subscription plans." },
      { property: "og:title", content: "Plan Management | FoodPulse Admin" },
      { property: "og:description", content: "Create, edit and deactivate mess subscription plans." },
    ],
  }),
  component: AdminPlansPage,
});

const emptyPlan: Plan = {
  id: "",
  name: "",
  type: "Monthly",
  price: 0,
  durationDays: 30,
  meals: 90,
  includes: ["Breakfast", "Lunch", "Dinner"],
  description: "",
  status: "Active",
};

function AdminPlansPage() {
  const { plans, upsertPlan, togglePlanStatus, logAction } = useApp();
  const loading = useSimulatedLoad();
  const [addOpen, setAddOpen] = useState(false);
  const [editPlan, setEditPlan] = useState<Plan | null>(null);
  const [form, setForm] = useState<Plan>(emptyPlan);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmPlan, setConfirmPlan] = useState<Plan | null>(null);

  function toggleInclude(list: MealType[], meal: MealType): MealType[] {
    return list.includes(meal) ? list.filter((m) => m !== meal) : [...list, meal];
  }

  function openAdd() {
    setForm({ ...emptyPlan, id: `PLN-${Date.now().toString().slice(-5)}` });
    setErrors({});
    setAddOpen(true);
  }

  function validate(p: Plan) {
    const e: Record<string, string> = {};
    if (!p.name.trim()) e.name = "Plan name is required";
    if (p.price <= 0) e.price = "Price must be greater than 0";
    if (p.durationDays <= 0) e.durationDays = "Duration must be greater than 0";
    if (p.includes.length === 0) e.includes = "Select at least one meal";
    return e;
  }

  function saveNew() {
    const e = validate(form);
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    upsertPlan(form);
    logAction({ user: "Ravi Krishnan (Admin)", action: "Added plan", module: "Plans", description: `${form.name} created at ${formatMoney(form.price)}`, status: "Success" });
    toast.success(`${form.name} plan created`);
    setAddOpen(false);
  }

  function saveEdit(original: Plan) {
    if (!editPlan) return;
    const e = validate(editPlan);
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    upsertPlan(editPlan);
    const priceChanged = original.price !== editPlan.price;
    logAction({
      user: "Ravi Krishnan (Admin)",
      action: "Updated plan",
      module: "Plans",
      description: priceChanged
        ? `${editPlan.name} price changed: ${formatMoney(original.price)} → ${formatMoney(editPlan.price)}`
        : `${editPlan.name} details updated`,
      status: "Success",
    });
    toast.success("Plan updated — changes now appear on the student Available Plans page");
    setEditPlan(null);
  }

  function confirmToggle() {
    if (!confirmPlan) return;
    togglePlanStatus(confirmPlan.id);
    const newStatus = confirmPlan.status === "Active" ? "Inactive" : "Active";
    logAction({
      user: "Ravi Krishnan (Admin)",
      action: newStatus === "Inactive" ? "Deactivated plan" : "Activated plan",
      module: "Plans",
      description: `${confirmPlan.name} ${newStatus === "Inactive" ? "deactivated" : "activated"}`,
      status: "Success",
    });
    toast.success(`${confirmPlan.name} ${newStatus === "Inactive" ? "deactivated" : "activated"}`);
    setConfirmPlan(null);
  }

  return (
    <div>
      <PageHeader
        title="Plan Management"
        description="Manage mess subscription plans. Changes appear immediately on the student Available Plans page."
        actions={
          <Button onClick={openAdd}>
            <Plus className="mr-1.5 size-4" /> Add Plan
          </Button>
        }
      />

      <div className="mb-4 flex items-start gap-2 rounded-lg border border-info/25 bg-info/10 p-3 text-sm text-foreground">
        <Info className="mt-0.5 size-4 shrink-0 text-info" />
        <p>Any plan you add, edit, or deactivate here will be instantly reflected on the student's Available Plans page.</p>
      </div>

      {loading ? (
        <CardsSkeleton count={3} />
      ) : plans.length === 0 ? (
        <EmptyState title="No plans yet" description="Add your first subscription plan to get started." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((p) => (
            <SectionCard
              key={p.id}
              title={p.name}
              description={`${p.type} · ${p.durationDays} days · ${p.meals} meals`}
              actions={<StatusBadge status={p.status} />}
            >
              <p className="font-display text-2xl font-semibold">{formatMoney(p.price)}</p>
              <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {p.includes.map((m) => (
                  <span key={m} className="rounded-full bg-muted px-2 py-0.5 text-xs">{m}</span>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" onClick={() => { setEditPlan(p); setErrors({}); }}>Edit</Button>
                <Button
                  variant={p.status === "Active" ? "destructive" : "default"}
                  size="sm"
                  onClick={() => setConfirmPlan(p)}
                >
                  {p.status === "Active" ? "Deactivate" : "Activate"}
                </Button>
              </div>
            </SectionCard>
          ))}
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Plan</DialogTitle>
            <DialogDescription>Create a new subscription plan for students.</DialogDescription>
          </DialogHeader>
          <PlanForm form={form} setForm={setForm} errors={errors} toggleInclude={toggleInclude} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={saveNew}>Create plan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editPlan} onOpenChange={(o) => !o && setEditPlan(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Plan</DialogTitle>
            <DialogDescription>Update {editPlan?.name}.</DialogDescription>
          </DialogHeader>
          {editPlan && (
            <PlanForm form={editPlan} setForm={setEditPlan} errors={errors} toggleInclude={toggleInclude} />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditPlan(null)}>Cancel</Button>
            <Button
              onClick={() => {
                const original = plans.find((p) => p.id === editPlan?.id);
                if (original) saveEdit(original);
              }}
            >
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!confirmPlan}
        onOpenChange={(o) => !o && setConfirmPlan(null)}
        title={confirmPlan?.status === "Active" ? "Deactivate plan?" : "Activate plan?"}
        description={`This will ${confirmPlan?.status === "Active" ? "deactivate" : "activate"} ${confirmPlan?.name}. Deactivated plans are hidden from students.`}
        confirmLabel={confirmPlan?.status === "Active" ? "Deactivate" : "Activate"}
        destructive={confirmPlan?.status === "Active"}
        onConfirm={confirmToggle}
      />
    </div>
  );
}

function PlanForm({
  form,
  setForm,
  errors,
  toggleInclude,
}: {
  form: Plan;
  setForm: (p: Plan) => void;
  errors: Record<string, string>;
  toggleInclude: (list: MealType[], meal: MealType) => MealType[];
}) {
  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="p-name">Plan Name</Label>
        <Input id="p-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} aria-invalid={!!errors.name} />
        {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="p-type">Type</Label>
          <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as Plan["type"] })}>
            <SelectTrigger id="p-type"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Weekly">Weekly</SelectItem>
              <SelectItem value="Monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="p-status">Status</Label>
          <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Plan["status"] })}>
            <SelectTrigger id="p-status"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label htmlFor="p-price">Price (₹)</Label>
          <Input id="p-price" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} aria-invalid={!!errors.price} />
        </div>
        <div>
          <Label htmlFor="p-duration">Duration (days)</Label>
          <Input id="p-duration" type="number" value={form.durationDays} onChange={(e) => setForm({ ...form, durationDays: Number(e.target.value) })} aria-invalid={!!errors.durationDays} />
        </div>
        <div>
          <Label htmlFor="p-meals">Total Meals</Label>
          <Input id="p-meals" type="number" value={form.meals} onChange={(e) => setForm({ ...form, meals: Number(e.target.value) })} />
        </div>
      </div>
      {(errors.price || errors.durationDays) && (
        <p className="text-xs text-destructive">{errors.price ?? errors.durationDays}</p>
      )}
      <div>
        <Label>Included Meals</Label>
        <div className="mt-1 flex gap-4">
          {MEAL_TYPES.map((meal) => (
            <label key={meal} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={form.includes.includes(meal)}
                onCheckedChange={() => setForm({ ...form, includes: toggleInclude(form.includes, meal) })}
              />
              {meal}
            </label>
          ))}
        </div>
        {errors.includes && <p className="mt-1 text-xs text-destructive">{errors.includes}</p>}
      </div>
      <div>
        <Label htmlFor="p-desc">Description</Label>
        <Textarea id="p-desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
      </div>
    </div>
  );
}
