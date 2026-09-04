import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ffljuwtbdszmarcokmvh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmbGp1d3RiZHN6bWFyY29rbXZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0NzM5MzIsImV4cCI6MjEwNDA0OTkzMn0.31gR9_lZMERB5RDZoarImsUuFJdcZLTCe-94e7bwOaA';

export const supabase = createClient(supabaseUrl, supabaseKey);