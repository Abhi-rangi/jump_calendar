export const dynamic = "force-dynamic";

import { CreateLinkForm } from "@/components/dashboard/links/create-link-form";

export default function NewLinkPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Create Scheduling Link
        </h2>
        <p className="text-muted-foreground">
          Set up a new scheduling link for your clients
        </p>
      </div>

      <CreateLinkForm />
    </div>
  );
}
