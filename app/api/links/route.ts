import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { z } from 'zod'

const createLinkSchema = z.object({
    name: z.string().min(2),
    slug: z.string().min(2),
    duration: z.number().min(15),
    maxAdvanceDays: z.number().nullable(),
    maxUses: z.number().nullable(),
    expirationDate: z.string().nullable(),
    customQuestions: z.array(
        z.object({
            id: z.string(),
            text: z.string(),
        })
    ),
})

export async function GET() {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const links = await prisma.schedulingLink.findMany({
        where: {
            user: {
                email: session.user.email
            }
        },
        include: {
            meetings: true,
            user: {
                select: {
                    name: true,
                    email: true,
                    image: true
                }
            }
        }
    })

    return NextResponse.json(links)
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const data = await request.json()
        const validatedData = createLinkSchema.parse(data)

        // Get or create user
        let user = await prisma.user.findUnique({
            where: { email: session.user.email }
        })

        if (!user) {
            // Create user if they don't exist
            user = await prisma.user.create({
                data: {
                    email: session.user.email,
                    name: session.user.name || null,
                    image: session.user.image || null,
                }
            })
        }

        // Check if slug is already taken
        const existingLink = await prisma.schedulingLink.findUnique({
            where: { slug: validatedData.slug }
        })

        if (existingLink) {
            return NextResponse.json(
                { error: 'Slug already taken' },
                { status: 400 }
            )
        }

        // Create the link
        const link = await prisma.schedulingLink.create({
            data: {
                name: validatedData.name,
                slug: validatedData.slug,
                duration: validatedData.duration,
                maxAdvanceDays: validatedData.maxAdvanceDays,
                maxUses: validatedData.maxUses,
                expirationDate: validatedData.expirationDate ? new Date(validatedData.expirationDate) : null,
                customQuestions: validatedData.customQuestions,
                userId: user.id
            }
        })

        return NextResponse.json(link)
    } catch (error) {
        console.error('Error creating link:', error)
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid request data', details: error.errors },
                { status: 400 }
            )
        }
        return NextResponse.json(
            { error: 'Failed to create link' },
            { status: 500 }
        )
    }
} 