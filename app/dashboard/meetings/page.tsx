import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";
import { MeetingsList } from "@/components/dashboard/meetings/meetings-list";
import { redirect } from "next/navigation";

export default async function MeetingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/auth/signin");
  }

  // Fetch meetings for the user's links
  const meetings = await prisma.meeting.findMany({
    where: {
      link: {
        user: {
          email: session.user.email,
        },
      },
    },
    include: {
      link: {
        select: {
          name: true,
          duration: true,
          customQuestions: true,
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: {
      date: "desc",
    },
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Scheduled Meetings
        </h2>
        <p className="text-muted-foreground">
          View and manage your upcoming meetings
        </p>
      </div>

      <MeetingsList initialMeetings={meetings} />
    </div>
  );
}
