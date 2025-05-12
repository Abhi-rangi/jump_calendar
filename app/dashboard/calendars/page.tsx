import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";

export default async function CalendarsPage() {
  const user = await getCurrentUser();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Connected Calendars
          </h2>
          <p className="text-muted-foreground">
            Manage your calendar connections for scheduling
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span>Primary Google Calendar</span>
            </CardTitle>
            <CardDescription>Connected with {user?.email}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              <p className="text-muted-foreground">Status: Connected</p>
              <p className="text-muted-foreground mt-1">
                Last synced: Just now
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between gap-2">
            <Button variant="outline" size="sm" asChild>
              <a
                href="https://calendar.google.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                View Calendar
              </a>
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Sync now
              </Button>
              <Button variant="outline" size="sm">
                Disconnect
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
