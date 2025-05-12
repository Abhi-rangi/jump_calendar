export const dynamic = "force-dynamic";

import type React from "react";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardHeader from "@/components/dashboard/header";
import DashboardSidebar from "@/components/dashboard/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      redirect("/auth/signin");
    }

    return (
      <div className="flex min-h-screen flex-col">
        <DashboardHeader user={user} />
        <div className="flex flex-1">
          <DashboardSidebar />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Authentication error in dashboard:", error);
    redirect("/auth/signin");
  }
}
