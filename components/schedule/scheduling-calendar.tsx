"use client";

import { type SchedulingLink, type User } from "@prisma/client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Clock } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { ClientInfoForm } from "@/components/schedule/client-info-form";
import { ConfirmationScreen } from "@/components/schedule/confirmation-screen";

interface SchedulingCalendarProps {
  link: SchedulingLink & {
    user: Pick<User, "name" | "email" | "image">;
  };
}

type Step = "date" | "time" | "info" | "confirmation";

export function SchedulingCalendar({ link }: SchedulingCalendarProps) {
  const [step, setStep] = useState<Step>("date");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // In a real app, these would be calculated based on the advisor's availability
  const availableTimes = [
    "9:00 AM",
    "10:00 AM",
    "11:00 AM",
    "1:00 PM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM",
  ];

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setStep("time");
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep("info");
  };

  const handleBack = () => {
    if (step === "time") {
      setStep("date");
      setSelectedTime(null);
    } else if (step === "info") {
      setStep("time");
    }
  };

  const handleSubmit = () => {
    setStep("confirmation");
  };

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col md:flex-row">
        <div className="bg-muted p-6 md:w-64">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  step === "date" ? "bg-primary" : "bg-muted-foreground"
                } text-primary-foreground`}
              >
                1
              </div>
              <span className={step === "date" ? "font-medium" : ""}>
                Select Date
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  step === "time" ? "bg-primary" : "bg-muted-foreground"
                } text-primary-foreground`}
              >
                2
              </div>
              <span className={step === "time" ? "font-medium" : ""}>
                Select Time
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  step === "info" ? "bg-primary" : "bg-muted-foreground"
                } text-primary-foreground`}
              >
                3
              </div>
              <span className={step === "info" ? "font-medium" : ""}>
                Your Information
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  step === "confirmation" ? "bg-primary" : "bg-muted-foreground"
                } text-primary-foreground`}
              >
                4
              </div>
              <span className={step === "confirmation" ? "font-medium" : ""}>
                Confirmation
              </span>
            </div>
          </div>
        </div>

        <CardContent className="flex-1 p-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">{link.name}</h2>
              <p className="text-gray-600">
                with {link.user.name || link.user.email}
              </p>
              <p className="text-gray-600">{link.duration} minutes</p>
            </div>

            {step === "date" && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-lg font-medium">
                    <CalendarIcon className="h-5 w-5 text-primary" />
                    <span>Select a Date</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Pick a day for your {link.duration}-minute meeting
                  </p>
                </div>
                <div className="flex justify-center py-4">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    disabled={(date) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const maxDate = new Date();
                      maxDate.setDate(
                        maxDate.getDate() + (link.maxAdvanceDays || 30)
                      );
                      return (
                        date < today ||
                        date > maxDate ||
                        date.getDay() === 0 ||
                        date.getDay() === 6
                      );
                    }}
                    className="rounded-md border"
                  />
                </div>
              </div>
            )}

            {step === "time" && selectedDate && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Button variant="ghost" onClick={handleBack}>
                    &larr; Back
                  </Button>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-lg font-medium">
                      <Clock className="h-5 w-5 text-primary" />
                      <span>Select a Time</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {selectedDate.toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="w-16"></div>
                </div>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
                  {availableTimes.map((time) => (
                    <Button
                      key={time}
                      variant="outline"
                      className="h-14"
                      onClick={() => handleTimeSelect(time)}
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {step === "info" && selectedDate && selectedTime && (
              <ClientInfoForm
                link={link}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                onBack={handleBack}
                onSubmit={handleSubmit}
              />
            )}

            {step === "confirmation" && selectedDate && selectedTime && (
              <ConfirmationScreen
                link={link}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
              />
            )}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
