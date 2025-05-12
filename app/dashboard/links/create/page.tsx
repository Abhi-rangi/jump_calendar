export const dynamic = "force-dynamic";

import { CreateLinkForm } from "@/components/dashboard/links/create-link-form";

export default function CreateLinkPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Create Scheduling Link</h1>
      <CreateLinkForm />
    </div>
  );
}
