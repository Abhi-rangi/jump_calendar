import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
    request: Request,
    { params }: { params: { slug: string } }
) {
    try {
        const link = await prisma.schedulingLink.findUnique({
            where: { slug: params.slug },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        image: true
                    }
                }
            }
        })

        if (!link) {
            return NextResponse.json(
                { error: 'Scheduling link not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(link)
    } catch (error) {
        console.error('Error fetching link:', error)
        return NextResponse.json(
            { error: 'Failed to fetch scheduling link' },
            { status: 500 }
        )
    }
} 