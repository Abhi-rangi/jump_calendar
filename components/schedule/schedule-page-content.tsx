"use client";

import { ScheduleBookingForm } from "@/components/schedule/schedule-booking-form";
import { useEffect, useState } from "react";
import type { SchedulingLink } from "@/lib/storage";

interface SchedulePageContentProps {
  initialLink: SchedulingLink | null;
}

export function SchedulePageContent({ initialLink }: SchedulePageContentProps) {
  const [link, setLink] = useState<SchedulingLink | null>(initialLink);
  const [isLoading, setIsLoading] = useState(false);

  if (!link) {
    return (
      <div className="container max-w-2xl py-12">
        <div className="rounded-lg border p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Scheduling Link Not Found</h1>
          <p className="text-muted-foreground">
            This scheduling link does not exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  // Check if link is expired
  const isExpired =
    link.expirationDate && new Date(link.expirationDate) < new Date();

  if (isExpired) {
    return (
      <div className="container max-w-2xl py-12">
        <div className="rounded-lg border p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Scheduling Link Expired</h1>
          <p className="text-muted-foreground">
            This scheduling link has expired and is no longer available.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-12">
      <div className="rounded-lg border p-8">
        <h1 className="text-2xl font-bold mb-2">{link.name}</h1>
        <div className="flex items-center gap-2 mb-8">
          <p className="text-muted-foreground">
            Duration: {link.duration} minutes
          </p>
          {link.advisor?.name && (
            <>
              <span className="text-muted-foreground">•</span>
              <p className="text-muted-foreground">with {link.advisor.name}</p>
            </>
          )}
        </div>
        <ScheduleBookingForm link={link} />
      </div>
    </div>
  );
}
