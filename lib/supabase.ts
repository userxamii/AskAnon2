import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jvjdhmrnhlnxreqzoxxf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2amRobXJuaGxueHJlcXpveHhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5OTg0MzEsImV4cCI6MjA5MDU3NDQzMX0.DKqHe2PI1VuMhRZuiaT42b-P2yLDRR6tzZebSiLgRUc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,      
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,    
  },
});