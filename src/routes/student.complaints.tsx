import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SectionCard } from "@/components/fp/page-header";
import { StatusBadge } from "@/components/fp/status-badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/fp/states";
import { useApp } from "@/store/app-store";
import { CURRENT_STUDENT_ID, formatDate } from "@/data/mock";

export const Route = createFileRoute("/student/complaints")({
  head: () => ({
    meta: [
      { title: "My Complaints — FoodPulse Student Portal" },
      { name: "description", content: "Track the status of complaints and suggestions you have submitted." },
      { property: "og:title", content: "My Complaints — FoodPulse Student Portal" },
      { property: "og:description", content: "View manager responses to your complaints." },
    ],
  }),
  component: ComplaintsPage,
});

function ComplaintsPage() {
  const { complaints } = useApp();
  const [status, setStatus] = useState("all");

  const mine = useMemo(
    () => complaints.filter((c) => c.studentId === CURRENT_STUDENT_ID).sort((a, b) => (a.date < b.date ? 1 : -1)),
    [complaints],
  );
  const filtered = status === "all" ? mine : mine.filter((c) => c.status === status);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Complaints"
        description="Track responses to complaints and suggestions you've raised."
        breadcrumbs={[{ label: "Student", to: "/student" }, { label: "Complaints" }]}
        actions={
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="OPEN">Open</SelectItem>
              <SelectItem value="IN PROGRESS">In Progress</SelectItem>
              <SelectItem value="RESOLVED">Resolved</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      {mine.length === 0 ? (
        <SectionCard><EmptyState title="No complaints filed" description="Complaints you raise from the Feedback page will appear here." /></SectionCard>
      ) : filtered.length === 0 ? (
        <SectionCard><EmptyState title="No matching complaints" description="Try a different status filter." /></SectionCard>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((c) => (
            <div key={c.id} className="fp-surface p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{c.id}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(c.date)} · {c.meal} · {c.category}</p>
                </div>
                <StatusBadge status={c.status} />
              </div>
              <p className="mt-3 text-sm">{c.description}</p>
              {c.response ? (
                <div className="mt-3 rounded-lg bg-primary-soft/40 p-3 text-sm">
                  <p className="text-xs font-semibold text-primary uppercase">Manager Response</p>
                  <p className="mt-1 text-muted-foreground">{c.response}</p>
                </div>
              ) : (
                <p className="mt-3 text-xs text-muted-foreground">Awaiting a response from the mess manager.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
