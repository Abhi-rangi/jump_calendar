import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')

    const link = await prisma.schedulingLink.findUnique({
        where: { slug: slug || '' },
        include: {
            user: {
                select: {
                    name: true,
                    email: true
                }
            }
        }
    })

    const allLinks = await prisma.schedulingLink.findMany({
        include: {
            user: {
                select: {
                    name: true,
                    email: true
                }
            }
        }
    })

    return NextResponse.json({
        requestedLink: link,
        allLinks: allLinks
    })
} 