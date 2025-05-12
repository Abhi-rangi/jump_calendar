import { prisma } from './db'

export async function migrateLocalStorageData(email: string) {
    // First, find the user
    const user = await prisma.user.findUnique({
        where: { email }
    })

    if (!user) {
        throw new Error('User not found')
    }

    // Only run in browser environment
    if (typeof window === 'undefined') {
        return
    }

    // Get localStorage data
    const links = JSON.parse(localStorage.getItem('schedulingLinks') || '[]')
    const meetings = JSON.parse(localStorage.getItem('meetings') || '[]')

    // Migrate links
    for (const link of links) {
        if (link.advisorEmail === email) {
            const existingLink = await prisma.schedulingLink.findUnique({
                where: { slug: link.slug }
            })

            if (!existingLink) {
                await prisma.schedulingLink.create({
                    data: {
                        name: link.name,
                        slug: link.slug,
                        duration: link.duration,
                        maxAdvanceDays: link.maxAdvanceDays,
                        maxUses: link.maxUses,
                        expirationDate: link.expirationDate ? new Date(link.expirationDate) : null,
                        customQuestions: link.customQuestions || {},
                        userId: user.id
                    }
                })
            }
        }
    }

    // Migrate meetings
    for (const meeting of meetings) {
        const link = await prisma.schedulingLink.findFirst({
            where: {
                slug: meeting.linkSlug,
                userId: user.id
            }
        })

        if (link) {
            const existingMeeting = await prisma.meeting.findFirst({
                where: {
                    linkId: link.id,
                    clientEmail: meeting.clientEmail,
                    date: new Date(meeting.date)
                }
            })

            if (!existingMeeting) {
                await prisma.meeting.create({
                    data: {
                        linkId: link.id,
                        clientName: meeting.clientName,
                        clientEmail: meeting.clientEmail,
                        linkedin: meeting.linkedin,
                        date: new Date(meeting.date),
                        time: meeting.time,
                        duration: meeting.duration,
                        answers: meeting.answers || {}
                    }
                })
            }
        }
    }

    // Clear localStorage after successful migration
    localStorage.removeItem('schedulingLinks')
    localStorage.removeItem('meetings')
} 