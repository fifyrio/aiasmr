-- Fix database references to incorrect 'profiles' table
-- This script removes any constraints referencing 'profiles' and creates correct ones

-- First, check existing constraints on videos table
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name='videos';

-- Drop any constraints referencing 'profiles' table
-- Note: Replace 'constraint_name_here' with actual constraint name from above query
-- This is a template - you need to identify the actual constraint name first

-- Example of what might need to be fixed:
-- ALTER TABLE videos DROP CONSTRAINT IF EXISTS videos_user_id_fkey;

-- Recreate the correct foreign key constraint
-- videos.user_id should reference auth.users(id), not profiles
ALTER TABLE videos DROP CONSTRAINT IF EXISTS videos_user_id_fkey;
ALTER TABLE videos ADD CONSTRAINT videos_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id);

-- Verify the fix
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name='videos';