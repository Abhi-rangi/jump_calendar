"use client";

import { Button } from "@/components/ui/button";
import { Calendar, Clock, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface ConfirmationScreenProps {
  link: {
    name: string;
    advisor?: {
      name: string;
      email?: string;
      image?: string;
    };
  };
  selectedDate: Date;
  selectedTime: string;
}

export function ConfirmationScreen({
  link,
  selectedDate,
  selectedTime,
}: ConfirmationScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="mb-6 rounded-full bg-green-100 p-3">
        <CheckCircle2 className="h-12 w-12 text-green-600" />
      </div>
      <h2 className="mb-2 text-2xl font-bold">Meeting Scheduled!</h2>
      <p className="mb-6 text-muted-foreground">
        Your meeting has been confirmed
      </p>

      <div className="mb-8 w-full max-w-md rounded-lg border p-6">
        <h3 className="mb-4 text-lg font-medium">
          {link.name}
          {link.advisor ? ` with ${link.advisor.name}` : ""}
        </h3>
        <div className="space-y-2">
          <div className="flex items-center">
            <Calendar className="mr-2 h-5 w-5 text-primary" />
            <span>
              {selectedDate.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
          <div className="flex items-center">
            <Clock className="mr-2 h-5 w-5 text-primary" />
            <span>{selectedTime}</span>
          </div>
        </div>
      </div>

      <p className="mb-4 text-sm text-muted-foreground">
        A calendar invitation has been sent to your email address.
      </p>

      <div className="space-x-4">
        <Button asChild>
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    </div>
  );
}
