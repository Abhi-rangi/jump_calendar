"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowLeft,
  Calendar,
  Clock,
  ExternalLink,
  Linkedin,
  User,
} from "lucide-react";
import Link from "next/link";
import { Meeting } from "@/lib/storage";

function convertTo24Hour(time: string): string {
  const [hour, modifier] = time.split(" ");
  let [hours, minutes] = hour.split(":");

  if (hours === "12") {
    hours = "00";
  }

  if (modifier === "PM") {
    hours = String(parseInt(hours, 10) + 12);
  }

  return `${hours.padStart(2, "0")}:${minutes}`;
}

interface MeetingDetailsProps {
  meeting: Meeting;
  onClose: () => void;
}

export function MeetingDetails({ meeting, onClose }: MeetingDetailsProps) {
  const time24 = convertTo24Hour(meeting.time);
  const meetingDate = new Date(`${meeting.date}T${time24}`);

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" onClick={onClose} className="mr-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to meetings
        </Button>
        <h3 className="text-xl font-bold">{meeting.linkName} Details</h3>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Meeting Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 rounded-lg border p-4">
              <User className="h-5 w-5 text-primary" />
              <div>
                <div className="font-medium">{meeting.clientName}</div>
                <div className="text-sm text-muted-foreground">
                  {meeting.clientEmail}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-lg border p-4">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <div className="font-medium">
                  {meetingDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-lg border p-4">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <div className="font-medium">{meeting.time}</div>
                <div className="text-sm text-muted-foreground">
                  {meeting.duration} minutes
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              <ExternalLink className="mr-2 h-4 w-4" />
              Join Meeting
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Client Responses</CardTitle>
          <CardDescription>Answers provided when scheduling</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {meeting.answers.map((item, index) => (
            <div key={index} className="space-y-2 rounded-lg border p-4">
              <div className="font-medium">Question {index + 1}</div>
              <p className="text-sm">{item.answer}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
