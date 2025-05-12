import { Button } from "@/components/ui/button"
import { Calendar, Plus } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { getCurrentUser } from "@/lib/auth"
import { ConnectCalendarDialog } from "@/components/dashboard/calendars/connect-calendar-dialog"

export default async function CalendarsPage() {
  const user = await getCurrentUser()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Connected Calendars</h2>
          <p className="text-muted-foreground">Manage your calendar connections for scheduling</p>
        </div>
        <ConnectCalendarDialog />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
              <p className="text-muted-foreground mt-1">Last synced: Just now</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" size="sm">
              Sync now
            </Button>
            <Button variant="outline" size="sm">
              Disconnect
            </Button>
          </CardFooter>
        </Card>

        <Card className="border-dashed">
          <CardHeader className="pb-3">
            <CardTitle>Connect Calendar</CardTitle>
            <CardDescription>Add another Google Calendar account</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-6">
            <div className="rounded-full bg-secondary p-3">
              <Plus className="h-6 w-6" />
            </div>
            <p className="mt-3 text-center text-sm text-muted-foreground">
              Connect another Google account to add more calendars
            </p>
          </CardContent>
          <CardFooter>
            <ConnectCalendarDialog>
              <Button className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Calendar
              </Button>
            </ConnectCalendarDialog>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
