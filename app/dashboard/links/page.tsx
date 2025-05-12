import { Button } from "@/components/ui/button";
import { LinksTable } from "@/components/dashboard/links/links-table";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function LinksPage() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Scheduling Links</h1>
        <Button asChild>
          <Link href="/dashboard/links/create">Create New Link</Link>
        </Button>
      </div>
      <LinksTable />
    </div>
  );
}
