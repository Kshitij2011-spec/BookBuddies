import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mvyrpgqmbpqlnclftyxm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12eXJwZ3FtYnBxbG5jbGZ0eXhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExMzI4MTcsImV4cCI6MjA4NjcwODgxN30.95sAmiosT36xXeCDNZuaAHwzA8vCRQA1Q-kx9wclCIY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);