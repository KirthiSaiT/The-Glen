// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://vtagxxmsxkxmumwnctzi.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0YWd4eG1zeGt4bXVtd25jdHppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MDYzODMsImV4cCI6MjA2NTQ4MjM4M30.Bl4GNC2gDMtaUUx6hMKbLwuBZX0ItN6NDbFIvgmQsy0";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);