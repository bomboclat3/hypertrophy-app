import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Lift = {
  id: string
  name: string
  created_at: string
  user_id: string
}

export type Workout = {
  id: string
  lift_id: string
  weight: number
  reps: number
  sets: number
  difficulty: number
  date: string
  user_id: string
}