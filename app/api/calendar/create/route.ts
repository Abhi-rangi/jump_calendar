import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createCalendarEvent } from "@/lib/google-calendar";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.accessToken) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const meeting = await request.json();

        // Validate required fields
        if (!meeting.clientName || !meeting.date || !meeting.time || !meeting.duration || !meeting.email) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        // If advisor email is not provided, use the authenticated user's email
        if (!meeting.advisorEmail && session.user?.email) {
            meeting.advisorEmail = session.user.email;
        }

        // Ensure we have an advisor email
        if (!meeting.advisorEmail) {
            return new NextResponse("Advisor email is required", { status: 400 });
        }

        const event = await createCalendarEvent(
            session.accessToken as string,
            meeting
        );

        return NextResponse.json(event);
    } catch (error) {
        console.error("Error creating calendar event:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
} 