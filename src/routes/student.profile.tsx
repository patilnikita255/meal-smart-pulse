import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader, SectionCard } from "@/components/fp/page-header";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useApp } from "@/store/app-store";

export const Route = createFileRoute("/student/profile")({
  head: () => ({
    meta: [
      { title: "Profile — FoodPulse Student Portal" },
      { name: "description", content: "Manage your profile details and password." },
      { property: "og:title", content: "Profile — FoodPulse Student Portal" },
      { property: "og:description", content: "Update your contact details on FoodPulse." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { currentUser, upsertUser, logout } = useApp();
  const navigate = useNavigate();

  const [name, setName] = useState(currentUser?.name ?? "");
  const [email, setEmail] = useState(currentUser?.email ?? "");
  const [contact, setContact] = useState(currentUser?.contact ?? "");
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; contact?: string }>({});

  const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });
  const [pwdErrors, setPwdErrors] = useState<{ current?: string; next?: string; confirm?: string }>({});

  const saveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!name.trim()) next.name = "Name is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Enter a valid email";
    if (!/^\+?\d[\d\s]{8,}$/.test(contact)) next.contact = "Enter a valid contact number";
    setErrors(next);
    if (Object.keys(next).length > 0 || !currentUser) return;
    upsertUser({ ...currentUser, name: name.trim(), email: email.trim(), contact: contact.trim() });
    toast.success("Profile updated");
    setEditing(false);
  };

  const savePassword = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof pwdErrors = {};
    if (!pwd.current) next.current = "Current password is required";
    if (pwd.next.length < 8) next.next = "New password must be at least 8 characters";
    if (pwd.confirm !== pwd.next) next.confirm = "Passwords do not match";
    setPwdErrors(next);
    if (Object.keys(next).length > 0) return;
    toast.success("Password changed (demo only — no backend)");
    setPwd({ current: "", next: "", confirm: "" });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" description="Manage your account details." breadcrumbs={[{ label: "Student", to: "/student" }, { label: "Profile" }]} />

      <SectionCard title="Personal Information" actions={!editing && <Button variant="outline" onClick={() => setEditing(true)}>Edit</Button>}>
        <form onSubmit={saveProfile} noValidate className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" value={name} disabled={!editing} onChange={(e) => setName(e.target.value)} aria-invalid={!!errors.name} />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={email} disabled={!editing} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!errors.email} />
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contact">Contact Number</Label>
            <Input id="contact" value={contact} disabled={!editing} onChange={(e) => setContact(e.target.value)} aria-invalid={!!errors.contact} />
            {errors.contact && <p className="text-xs text-destructive">{errors.contact}</p>}
          </div>
          {editing && (
            <div className="sm:col-span-2 flex gap-2">
              <Button type="submit">Save Changes</Button>
              <Button type="button" variant="outline" onClick={() => { setEditing(false); setName(currentUser?.name ?? ""); setEmail(currentUser?.email ?? ""); setContact(currentUser?.contact ?? ""); setErrors({}); }}>
                Cancel
              </Button>
            </div>
          )}
        </form>
      </SectionCard>

      <SectionCard title="Change Password">
        <form onSubmit={savePassword} noValidate className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="current">Current Password</Label>
            <Input id="current" type="password" value={pwd.current} onChange={(e) => setPwd({ ...pwd, current: e.target.value })} aria-invalid={!!pwdErrors.current} />
            {pwdErrors.current && <p className="text-xs text-destructive">{pwdErrors.current}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="next">New Password</Label>
            <Input id="next" type="password" value={pwd.next} onChange={(e) => setPwd({ ...pwd, next: e.target.value })} aria-invalid={!!pwdErrors.next} />
            {pwdErrors.next && <p className="text-xs text-destructive">{pwdErrors.next}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm">Confirm New Password</Label>
            <Input id="confirm" type="password" value={pwd.confirm} onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })} aria-invalid={!!pwdErrors.confirm} />
            {pwdErrors.confirm && <p className="text-xs text-destructive">{pwdErrors.confirm}</p>}
          </div>
          <div className="sm:col-span-3">
            <Button type="submit">Update Password</Button>
          </div>
        </form>
      </SectionCard>

      <SectionCard title="Session">
        <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => { logout(); toast.success("Signed out"); navigate({ to: "/login" }); }}>
          Logout
        </Button>
      </SectionCard>
    </div>
  );
}
