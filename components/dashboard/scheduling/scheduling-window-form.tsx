"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface TimeSlot {
  id: string
  day: string
  startTime: string
  endTime: string
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

const HOURS = Array.from({ length: 24 }, (_, i) => {
  const hour = i
  const amPm = hour >= 12 ? "PM" : "AM"
  const displayHour = hour % 12 || 12
  return {
    value: hour.toString().padStart(2, "0") + ":00",
    label: `${displayHour}:00 ${amPm}`,
  }
})

export function SchedulingWindowForm() {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([
    {
      id: "1",
      day: "Monday",
      startTime: "09:00",
      endTime: "17:00",
    },
    {
      id: "2",
      day: "Tuesday",
      startTime: "09:00",
      endTime: "17:00",
    },
    {
      id: "3",
      day: "Wednesday",
      startTime: "09:00",
      endTime: "17:00",
    },
    {
      id: "4",
      day: "Thursday",
      startTime: "09:00",
      endTime: "17:00",
    },
    {
      id: "5",
      day: "Friday",
      startTime: "09:00",
      endTime: "17:00",
    },
  ])

  const addTimeSlot = () => {
    setTimeSlots([
      ...timeSlots,
      {
        id: Date.now().toString(),
        day: "Monday",
        startTime: "09:00",
        endTime: "17:00",
      },
    ])
  }

  const removeTimeSlot = (id: string) => {
    setTimeSlots(timeSlots.filter((slot) => slot.id !== id))
  }

  const updateTimeSlot = (id: string, field: keyof TimeSlot, value: string) => {
    setTimeSlots(timeSlots.map((slot) => (slot.id === id ? { ...slot, [field]: value } : slot)))
  }

  const handleSave = () => {
    // In a real app, this would save to a database
    console.log("Saving time slots:", timeSlots)
    toast({
      title: "Availability saved",
      description: "Your scheduling windows have been updated.",
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Weekly Availability</CardTitle>
          <CardDescription>Set your regular working hours for each day of the week</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {timeSlots.map((slot) => (
            <div key={slot.id} className="flex flex-wrap items-center gap-4 rounded-lg border p-4">
              <div className="flex-1 min-w-[180px]">
                <Select value={slot.day} onValueChange={(value) => updateTimeSlot(slot.id, "day", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS.map((day) => (
                      <SelectItem key={day} value={day}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 min-w-[180px]">
                <Select value={slot.startTime} onValueChange={(value) => updateTimeSlot(slot.id, "startTime", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Start time" />
                  </SelectTrigger>
                  <SelectContent>
                    {HOURS.map((hour) => (
                      <SelectItem key={`start-${hour.value}`} value={hour.value}>
                        {hour.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 min-w-[180px]">
                <Select value={slot.endTime} onValueChange={(value) => updateTimeSlot(slot.id, "endTime", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="End time" />
                  </SelectTrigger>
                  <SelectContent>
                    {HOURS.map((hour) => (
                      <SelectItem key={`end-${hour.value}`} value={hour.value}>
                        {hour.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button variant="ghost" size="icon" className="shrink-0" onClick={() => removeTimeSlot(slot.id)}>
                <Trash2 className="h-5 w-5 text-muted-foreground" />
                <span className="sr-only">Remove</span>
              </Button>
            </div>
          ))}
          <Button variant="outline" onClick={addTimeSlot}>
            Add time slot
          </Button>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSave}>Save availability</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
