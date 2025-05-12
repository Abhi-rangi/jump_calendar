import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { SchedulingWindowForm } from "@/components/dashboard/scheduling/scheduling-window-form"

export default function SchedulingPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Scheduling Windows</h2>
          <p className="text-muted-foreground">Set your availability for meetings</p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Save Availability
        </Button>
      </div>

      <div className="border rounded-md p-6">
        <SchedulingWindowForm />
      </div>
    </div>
  )
}
