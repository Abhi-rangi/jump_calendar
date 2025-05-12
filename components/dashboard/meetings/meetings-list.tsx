"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, User, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import type { Meeting } from "@prisma/client";

type MeetingWithLink = Meeting & {
  link: {
    name: string;
    duration: number;
    customQuestions?: any;
    user: {
      name: string | null;
      email: string | null;
    };
  };
};

interface MeetingsListProps {
  initialMeetings: MeetingWithLink[];
}

export function MeetingsList({ initialMeetings }: MeetingsListProps) {
  const [meetings, setMeetings] = useState(initialMeetings);

  // Group meetings by status
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingMeetings = meetings.filter((meeting) => {
    const meetingDate = new Date(meeting.date);
    meetingDate.setHours(0, 0, 0, 0);
    return meetingDate >= today;
  });

  const pastMeetings = meetings.filter((meeting) => {
    const meetingDate = new Date(meeting.date);
    meetingDate.setHours(0, 0, 0, 0);
    return meetingDate < today;
  });

  return (
    <Tabs defaultValue="upcoming" className="space-y-4">
      <TabsList>
        <TabsTrigger value="upcoming">
          Upcoming ({upcomingMeetings.length})
        </TabsTrigger>
        <TabsTrigger value="past">Past ({pastMeetings.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="upcoming" className="space-y-4">
        {upcomingMeetings.length === 0 ? (
          <Card>
            <CardHeader>
              <CardDescription className="text-center py-6">
                No upcoming meetings scheduled
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          upcomingMeetings.map((meeting) => (
            <MeetingCard key={meeting.id} meeting={meeting} />
          ))
        )}
      </TabsContent>

      <TabsContent value="past" className="space-y-4">
        {pastMeetings.length === 0 ? (
          <Card>
            <CardHeader>
              <CardDescription className="text-center py-6">
                No past meetings found
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          pastMeetings.map((meeting) => (
            <MeetingCard key={meeting.id} meeting={meeting} />
          ))
        )}
      </TabsContent>
    </Tabs>
  );
}

function MeetingCard({ meeting }: { meeting: MeetingWithLink }) {
  const meetingDate = new Date(meeting.date);
  const meetingTime = meeting.time;
  const createdAt = new Date(meeting.createdAt);

  // Parse custom questions if present
  let rawQuestions: any[] = [];
  if (meeting.link.customQuestions) {
    try {
      let parsed = meeting.link.customQuestions;
      if (typeof parsed === "string") {
        parsed = JSON.parse(parsed);
      }
      if (Array.isArray(parsed)) {
        rawQuestions = parsed;
      } else if (typeof parsed === "object") {
        rawQuestions = Object.values(parsed);
      }
    } catch {}
  }

  // Prepare answers
  let answers: Record<string, string> = {};
  if (meeting.answers) {
    if (typeof meeting.answers === "string") {
      try {
        answers = JSON.parse(meeting.answers);
      } catch {
        answers = {};
      }
    } else {
      answers = meeting.answers as Record<string, string>;
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{meeting.link.name}</CardTitle>
            <CardDescription>
              {meeting.link.duration} minutes with {meeting.clientName}
            </CardDescription>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <User className="h-4 w-4 text-primary" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-center gap-4 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-medium">Date & Time</div>
              <div className="text-muted-foreground">
                {meetingDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
                {" at "}
                {meetingTime}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-medium">Attendee</div>
              <div className="text-muted-foreground">
                {meeting.clientName} ({meeting.clientEmail})
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <span className="font-medium">Duration:</span>
            <span className="text-muted-foreground">
              {meeting.duration} minutes
            </span>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <span className="font-medium">Created At:</span>
            <span className="text-muted-foreground">
              {createdAt.toLocaleString()}
            </span>
          </div>

          {meeting.linkedin && (
            <div className="flex items-center gap-4 text-sm">
              <LinkIcon className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-medium">LinkedIn</div>
                <Link
                  href={meeting.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary"
                >
                  View Profile
                </Link>
              </div>
            </div>
          )}

          {rawQuestions.length > 0 && Object.keys(answers).length > 0 && (
            <div className="md:col-span-2 space-y-2">
              <div className="font-medium text-sm">Additional Information</div>
              <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                {rawQuestions.map((q: any, idx: number) => {
                  const questionText =
                    typeof q === "object" && q !== null && "text" in q
                      ? q.text
                      : String(q);
                  const answerKey =
                    typeof q === "object" && q !== null && "id" in q
                      ? q.id
                      : idx;
                  const answer = answers[answerKey];
                  return (
                    <div key={answerKey} className="mt-2">
                      <div className="font-medium">{questionText}</div>
                      <div>
                        {answer ? (
                          answer
                        ) : (
                          <span className="italic text-muted-foreground">
                            No answer
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
