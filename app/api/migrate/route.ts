import { NextResponse } from 'next/server'
import { migrateLocalStorageData } from '@/lib/migrations'

export async function POST(request: Request) {
    try {
        const { email } = await request.json()
        await migrateLocalStorageData(email)
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Migration error:', error)
        return NextResponse.json(
            { error: 'Migration failed' },
            { status: 500 }
        )
    }
} 