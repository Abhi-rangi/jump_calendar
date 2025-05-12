"use client";

import { type SchedulingLink, type User } from "@prisma/client";
import { SchedulingCalendar } from "@/components/schedule/scheduling-calendar";

interface ScheduleBookingFormProps {
  link: SchedulingLink & {
    user: Pick<User, "name" | "email" | "image">;
  };
}

export function ScheduleBookingForm({ link }: ScheduleBookingFormProps) {
  return <SchedulingCalendar link={link} />;
}
