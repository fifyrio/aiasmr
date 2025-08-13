-- Simple fix for videos table foreign key constraint issue
-- Run this in Supabase SQL Editor

-- First, find and drop any existing foreign key constraints on videos.user_id
DO $$ 
DECLARE 
    constraint_name_var text;
BEGIN
    -- Find the constraint name that's causing the issue
    SELECT constraint_name INTO constraint_name_var
    FROM information_schema.table_constraints 
    WHERE table_name = 'videos' 
      AND table_schema = 'public'
      AND constraint_type = 'FOREIGN KEY'
      AND constraint_name LIKE '%user_id%'
    LIMIT 1;
    
    IF constraint_name_var IS NOT NULL THEN
        EXECUTE format('ALTER TABLE public.videos DROP CONSTRAINT %I', constraint_name_var);
        RAISE NOTICE 'Dropped constraint: %', constraint_name_var;
    END IF;
    
    -- Also check for the specific constraint that might exist
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'videos_user_id_fkey' 
        AND table_name = 'videos'
    ) THEN
        ALTER TABLE public.videos DROP CONSTRAINT videos_user_id_fkey;
        RAISE NOTICE 'Dropped videos_user_id_fkey constraint';
    END IF;
END $$;

-- Add the correct constraint - reference auth.users directly since that's what user_profiles references
ALTER TABLE public.videos 
ADD CONSTRAINT videos_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE SET NULL;