// Simple cloud sync using Clerk's user metadata (no separate database needed)

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

export async function syncDataToCloud(lifts: Lift[], workouts: Workout[], userId: string) {
  if (!userId) return false

  try {
    const response = await fetch('/api/sync-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        lifts,
        workouts,
        userId
      })
    })

    return response.ok
  } catch (error) {
    console.error('Error syncing data:', error)
    return false
  }
}

export async function loadDataFromCloud(userId: string): Promise<{ lifts: Lift[], workouts: Workout[] }> {
  if (!userId) return { lifts: [], workouts: [] }

  try {
    const response = await fetch(`/api/load-data?userId=${userId}`)
    
    if (response.ok) {
      const data = await response.json()
      return {
        lifts: data.lifts || [],
        workouts: data.workouts || []
      }
    }
  } catch (error) {
    console.error('Error loading data:', error)
  }

  return { lifts: [], workouts: [] }
}
