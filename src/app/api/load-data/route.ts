import { NextRequest, NextResponse } from 'next/server'
import { clerkClient } from '@clerk/nextjs/server'

interface Lift {
  id: string;
  name: string;
  createdAt: string;
}

interface Workout {
  id: string;
  liftId: string;
  weight: number;
  reps: number;
  sets: number;
  difficulty: 1 | 2 | 3 | 4 | 5;
  date: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Get data from Clerk user metadata
    const clerk = await clerkClient()
    const user = await clerk.users.getUser(userId)
    const metadata = user.privateMetadata as { lifts?: Lift[]; workouts?: Workout[]; lastSync?: string }

    return NextResponse.json({
      lifts: metadata?.lifts || [],
      workouts: metadata?.workouts || [],
      lastSync: metadata?.lastSync || null
    })
  } catch (error) {
    console.error('Load error:', error)
    return NextResponse.json({ error: 'Load failed' }, { status: 500 })
  }
}