import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getGoogleCalendarEvents } from "@/lib/google-calendar";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.accessToken) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Get query parameters
        const url = new URL(request.url);
        const timeMin = url.searchParams.get("timeMin");
        const timeMax = url.searchParams.get("timeMax");

        const events = await getGoogleCalendarEvents(
            session.accessToken as string,
            timeMin ? new Date(timeMin) : undefined,
            timeMax ? new Date(timeMax) : undefined
        );

        return NextResponse.json(events);
    } catch (error) {
        console.error("Error fetching calendar events:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
} 