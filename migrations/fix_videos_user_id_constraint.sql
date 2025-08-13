-- Fix videos table user_id foreign key constraint
-- The constraint is currently referencing 'profiles' table which doesn't exist
-- It should reference 'user_profiles' table instead

-- First, let's check and drop the existing constraint if it exists
DO $$ 
BEGIN
    -- Check if the constraint exists and drop it
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'videos_user_id_fkey' 
        AND table_name = 'videos'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.videos DROP CONSTRAINT videos_user_id_fkey;
        RAISE NOTICE 'Dropped existing videos_user_id_fkey constraint';
    END IF;
    
    -- Also check for other possible constraint names
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name LIKE '%videos%user_id%' 
        AND table_name = 'videos'
        AND table_schema = 'public'
    ) THEN
        -- Get the actual constraint name and drop it
        PERFORM pg_exec(format('ALTER TABLE public.videos DROP CONSTRAINT %I', 
            (SELECT constraint_name FROM information_schema.table_constraints 
             WHERE constraint_name LIKE '%videos%user_id%' 
             AND table_name = 'videos' 
             AND table_schema = 'public' 
             LIMIT 1)));
        RAISE NOTICE 'Dropped existing user_id constraint';
    END IF;
END $$;

-- Now add the correct constraint referencing user_profiles
-- Note: user_id can be null for anonymous videos, so we allow that
ALTER TABLE public.videos 
ADD CONSTRAINT videos_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE SET NULL;

-- Add comment to document the change
COMMENT ON CONSTRAINT videos_user_id_fkey ON public.videos IS 
'Foreign key constraint referencing auth.users(id) - fixed from incorrect profiles table reference';

-- Verify the constraint was created
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name='videos'
    AND kcu.column_name='user_id';