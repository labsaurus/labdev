import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://noodfhbkuuyjmfygxetc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vb2RmaGJrdXV5am1meWd4ZXRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgyNDI2MTMsImV4cCI6MjA1MzgxODYxM30.f42EZgkm95vClA8ZOaVjNW67NYyDhYzR-jhPghE1VjY'

export const supabase = createClient(supabaseUrl, supabaseKey)