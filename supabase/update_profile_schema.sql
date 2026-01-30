-- Add favorite_genre and school_grade to profiles
ALTER TABLE profiles 
ADD COLUMN favorite_genre TEXT,
ADD COLUMN school_grade TEXT;

-- Comment out the old column if you want to keep data, or just stop using it
-- ALTER TABLE profiles DROP COLUMN reading_preferences;
