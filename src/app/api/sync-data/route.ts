import { NextRequest, NextResponse } from 'next/server'
import { clerkClient } from '@clerk/nextjs/server'

export async function POST(request: NextRequest) {
  try {
    const { lifts, workouts, userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Store data in Clerk user metadata
    const clerk = await clerkClient()
    await clerk.users.updateUserMetadata(userId, {
      privateMetadata: {
        lifts: lifts || [],
        workouts: workouts || [],
        lastSync: new Date().toISOString()
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }
}