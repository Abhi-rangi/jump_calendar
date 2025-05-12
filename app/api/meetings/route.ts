import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { z } from 'zod'
import { sendMeetingNotificationToAdvisor } from '@/lib/email'
import { createCalendarEvent } from '@/lib/google-calendar'

const createMeetingSchema = z.object({
    linkId: z.string(),
    date: z.string(),
    time: z.string(),
    attendee: z.object({
        name: z.string(),
        email: z.string().email(),
        linkedin: z.string(),
    }),
    notes: z.string().optional(),
    answers: z.record(z.string()),
})

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        console.log('Session info:', {
            hasAccessToken: !!session?.accessToken,
            hasUser: !!session?.user,
            userEmail: session?.user?.email,
        });

        const data = await request.json()
        const validatedData = createMeetingSchema.parse(data)

        // Get the scheduling link
        const link = await prisma.schedulingLink.findUnique({
            where: { id: validatedData.linkId },
            include: {
                user: {
                    select: {
                        email: true,
                        name: true,
                    },
                },
            },
        })

        if (!link) {
            return NextResponse.json({ error: 'Scheduling link not found' }, { status: 404 })
        }

        // Check if link is expired
        if (link.expirationDate && new Date(link.expirationDate) < new Date()) {
            return NextResponse.json({ error: 'Scheduling link has expired' }, { status: 400 })
        }

        // Check if link has reached its maximum uses
        if (link.maxUses) {
            const meetingsCount = await prisma.meeting.count({
                where: { linkId: link.id },
            })
            if (meetingsCount >= link.maxUses) {
                return NextResponse.json({ error: 'Scheduling link has reached its maximum uses' }, { status: 400 })
            }
        }

        // Create the meeting
        const meeting = await prisma.meeting.create({
            data: {
                linkId: link.id,
                clientName: validatedData.attendee.name,
                clientEmail: validatedData.attendee.email,
                linkedin: validatedData.attendee.linkedin,
                date: new Date(validatedData.date),
                time: validatedData.time,
                duration: link.duration,
                answers: validatedData.answers,
            },
        })

        // Create calendar event
        if (!session?.accessToken) {
            console.log('Skipping calendar event creation: No access token available');
        } else if (!link.user.email) {
            console.log('Skipping calendar event creation: No advisor email available');
        } else {
            try {
                console.log('Creating calendar event with details:', {
                    date: validatedData.date,
                    time: validatedData.time,
                    duration: link.duration,
                    clientEmail: validatedData.attendee.email,
                    advisorEmail: link.user.email,
                });

                const description = `
Meeting with ${validatedData.attendee.name}
LinkedIn: ${validatedData.attendee.linkedin}

${validatedData.answers && Object.keys(validatedData.answers).length > 0
                        ? '\nAdditional Information:\n' + Object.entries(validatedData.answers)
                            .map(([question, answer]) => `${question}: ${answer}`)
                            .join('\n')
                        : ''}
                `.trim();

                const calendarEvent = await createCalendarEvent(
                    session.accessToken,
                    {
                        clientName: validatedData.attendee.name,
                        date: validatedData.date,
                        time: validatedData.time,
                        duration: link.duration,
                        email: validatedData.attendee.email,
                        advisorEmail: link.user.email,
                        description: description,
                    }
                );
                console.log('Calendar event created successfully:', calendarEvent.htmlLink);
            } catch (error) {
                console.error('Error creating calendar event:', {
                    error,
                    message: error instanceof Error ? error.message : 'Unknown error',
                    stack: error instanceof Error ? error.stack : undefined,
                    hasAccessToken: !!session.accessToken,
                    meetingDetails: {
                        date: validatedData.date,
                        time: validatedData.time,
                        duration: link.duration,
                        hasClientEmail: !!validatedData.attendee.email,
                        hasAdvisorEmail: !!link.user.email,
                    }
                });
                // Don't block the meeting creation if calendar event fails
            }
        }

        // Send email notification to the advisor
        try {
            await sendMeetingNotificationToAdvisor({
                clientName: validatedData.attendee.name,
                clientEmail: validatedData.attendee.email,
                linkedin: validatedData.attendee.linkedin,
                date: new Date(validatedData.date),
                time: validatedData.time,
                duration: link.duration,
                answers: validatedData.answers,
                link: {
                    name: link.name,
                    user: {
                        name: link.user.name,
                        email: link.user.email,
                    },
                },
            });
        } catch (error) {
            console.error('Error sending email notification:', error);
            // Don't block the meeting creation if email fails
        }

        return NextResponse.json(meeting)
    } catch (error) {
        console.error('Error creating meeting:', error)
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 400 })
        }
        return NextResponse.json({ error: 'Failed to create meeting' }, { status: 500 })
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const linkId = searchParams.get('linkId')

    if (!linkId) {
        return NextResponse.json({ error: 'Link ID is required' }, { status: 400 })
    }

    const meetings = await prisma.meeting.findMany({
        where: { linkId },
        include: {
            link: true
        },
        orderBy: {
            date: 'desc'
        }
    })

    return NextResponse.json(meetings)
} 