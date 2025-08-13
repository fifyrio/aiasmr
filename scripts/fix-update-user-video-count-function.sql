-- Fix the update_user_video_count function to reference correct table name
-- The function is currently referencing 'profiles' but should reference 'user_profiles'

-- First, let's see the current function definition
-- You can run this in Supabase SQL Editor to see the current function:
-- SELECT pg_get_functiondef(oid) FROM pg_proc WHERE proname = 'update_user_video_count';

-- Drop and recreate the function with correct table reference
CREATE OR REPLACE FUNCTION update_user_video_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Update user_profiles table instead of profiles
    UPDATE user_profiles 
    SET total_videos_created = total_videos_created + 1 
    WHERE id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure the trigger exists and is properly attached
DROP TRIGGER IF EXISTS update_user_video_count_trigger ON videos;
CREATE TRIGGER update_user_video_count_trigger
    AFTER INSERT ON videos
    FOR EACH ROW
    EXECUTE FUNCTION update_user_video_count();

-- Verify the function was created correctly
SELECT pg_get_functiondef(oid) FROM pg_proc WHERE proname = 'update_user_video_count';