import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const DEMO = {
  student: { id: "00000000-0000-4000-8000-000000000001", email: "student.demo@foodpulse.demo", name: "Aarav Sharma" },
  manager: { id: "00000000-0000-4000-8000-000000000002", email: "manager.demo@foodpulse.demo", name: "Rohan Mehta" },
  admin: { id: "00000000-0000-4000-8000-000000000003", email: "admin.demo@foodpulse.demo", name: "Admin Demo" },
} as const;

function randomPassword() {
  const bytes = new Uint8Array(18);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("") + "Aa1!";
}

/**
 * One-click demo sign-in. Makes sure the demo account exists (linked to its seeded
 * profile) and returns a single-use sign-in token. No password is sent to the browser.
 */
export const demoSignIn = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ role: z.enum(["student", "manager", "admin"]) }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const acct = DEMO[data.role];
    const existing = await supabaseAdmin.auth.admin.getUserById(acct.id);
    if (!existing.data?.user) {
      const { error } = await supabaseAdmin.auth.admin.createUser({
        id: acct.id,
        email: acct.email,
        password: randomPassword(),
        email_confirm: true,
        user_metadata: { full_name: acct.name },
      });
      if (error) throw new Error("Unable to prepare the demo account. Please try again.");
    }
    const { data: link, error } = await supabaseAdmin.auth.admin.generateLink({ type: "magiclink", email: acct.email });
    if (error || !link.properties?.hashed_token) throw new Error("Unable to sign in to the demo. Please try again.");
    return { tokenHash: link.properties.hashed_token, email: acct.email };
  });

/** Admin-only: create a mess manager account and assign it to a mess. An email invite lets them set a password. */
export const createManagerAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        fullName: z.string().trim().min(2).max(100),
        email: z.string().trim().email().max(255),
        phone: z.string().trim().max(20).optional(),
        messId: z.string().uuid().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "ADMIN" });
    if (!isAdmin) throw new Error("Only administrators can add managers.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const created = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: randomPassword(),
      email_confirm: true,
      user_metadata: { full_name: data.fullName },
    });
    if (created.error || !created.data.user) {
      throw new Error(created.error?.message?.includes("already") ? "A user with this email already exists." : "Unable to create the manager account.");
    }
    const uid = created.data.user.id;
    let messId = data.messId;
    if (!messId) {
      const { data: m } = await supabaseAdmin.from("messes").select("id").order("created_at").limit(1).single();
      messId = m?.id;
    }
    await supabaseAdmin.from("profiles").insert({ id: uid, full_name: data.fullName, email: data.email, phone: data.phone || null });
    await supabaseAdmin.from("user_roles").insert({ user_id: uid, role: "MESS_MANAGER" });
    if (messId) await supabaseAdmin.from("mess_managers").insert({ user_id: uid, mess_id: messId });
    const { data: actor } = await supabaseAdmin.from("profiles").select("full_name").eq("id", context.userId).single();
    await supabaseAdmin.from("audit_logs").insert({
      actor_user_id: context.userId,
      actor_name: actor?.full_name ?? "Admin",
      action: "Manager created",
      module: "Managers",
      entity_type: "profile",
      entity_id: uid,
      description: `Added manager ${data.fullName} (${data.email})`,
    });
    await supabaseAdmin.from("notifications").insert({
      user_id: uid,
      type: "INFO",
      title: "Welcome to FoodPulse",
      message: "Your mess manager account is ready. Use Forgot password on the login page to set your password.",
    });
    return { id: uid };
  });
