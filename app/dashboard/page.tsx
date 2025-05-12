"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { Calendar, CreditCard, LucideLink, Users, Clock } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { storage } from "@/lib/storage";
import type { Meeting } from "@/lib/storage";
import { useSession } from "next-auth/react";

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  attendees?: { email: string }[];
}

function convertTo24Hour(time12h: string) {
  const [time, modifier] = time12h.split(" ");
  let [hours, minutes] = time.split(":");

  if (hours === "12") {
    hours = "00";
  }

  if (modifier === "PM") {
    hours = String(parseInt(hours, 10) + 12);
  }

  return `${hours.padStart(2, "0")}:${minutes}`;
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState({
    totalMeetings: 0,
    activeLinks: 0,
  });
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    const fetchCalendarEvents = async () => {
      try {
        setIsLoadingEvents(true);
        const response = await fetch("/api/calendar/events");
        if (!response.ok) throw new Error("Failed to fetch calendar events");
        const events = await response.json();
        setCalendarEvents(events);
      } catch (error) {
        console.error("Error fetching calendar events:", error);
      } finally {
        setIsLoadingEvents(false);
      }
    };

    const calculateMetrics = () => {
      const allMeetings = storage.getAllMeetings();
      console.log("All meetings:", allMeetings);

      // Filter meetings by advisor email
      const userMeetings = allMeetings.filter(
        (meeting) => meeting.advisorEmail === session?.user?.email
      );

      const now = new Date();

      // Calculate this week's meetings
      const startOfWeek = new Date(now);
      startOfWeek.setHours(0, 0, 0, 0);
      startOfWeek.setDate(now.getDate() - now.getDay()); // Start from Sunday

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // End on Saturday
      endOfWeek.setHours(23, 59, 59, 999);

      const thisWeekMeetings = userMeetings.filter((meeting) => {
        const time24 = convertTo24Hour(meeting.time);
        const meetingDate = new Date(`${meeting.date}T${time24}:00`);
        return meetingDate >= startOfWeek && meetingDate <= endOfWeek;
      });

      // Get active links for the current user
      const allLinks = storage.getAllLinks();
      const activeLinks = allLinks.filter((link) => {
        if (link.advisor?.email !== session?.user?.email) return false;
        if (link.expirationDate) {
          return new Date(link.expirationDate) > now;
        }
        return true;
      });

      console.log("This week meetings count:", thisWeekMeetings.length);
      console.log("Active links count:", activeLinks.length);

      setMetrics({
        totalMeetings: thisWeekMeetings.length,
        activeLinks: activeLinks.length,
      });
    };

    calculateMetrics();
    fetchCalendarEvents();

    // Set up an interval to refresh metrics and events every minute
    const intervalId = setInterval(() => {
      calculateMetrics();
      fetchCalendarEvents();
    }, 60000);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [session?.user?.email]);

  const formatMeetingDateTime = (date: string, time: string) => {
    const time24 = convertTo24Hour(time);
    const dateTime = new Date(`${date}T${time24}:00`);
    return dateTime.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatEventDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Welcome back, Abhishek
          </h2>
          <p className="text-muted-foreground">
            Here's an overview of your scheduling activity
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href="/dashboard/links/new">Create scheduling link</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Meetings
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{calendarEvents.length}</div>
            <p className="text-xs text-muted-foreground">
              From Google Calendar
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Connected Services
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">Google Calendar</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Calendar Events</CardTitle>
            <CardDescription>
              Your upcoming Google Calendar events
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingEvents ? (
              <div className="flex h-[200px] items-center justify-center">
                <p className="text-muted-foreground">Loading events...</p>
              </div>
            ) : calendarEvents.length > 0 ? (
              <div className="space-y-4">
                {calendarEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatEventDateTime(event.start)}
                      </p>
                      {event.attendees && event.attendees.length > 0 && (
                        <p className="text-sm text-muted-foreground">
                          {event.attendees.length} attendee(s)
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
                <div className="flex flex-col items-center gap-1 text-center">
                  <Calendar className="h-10 w-10 text-muted-foreground" />
                  <h3 className="font-medium">No calendar events</h3>
                  <p className="text-sm text-muted-foreground">
                    Your Google Calendar events will appear here
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
