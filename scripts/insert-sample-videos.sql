-- Insert sample videos into Supabase videos table
-- Based on the uploaded R2 videos and database schema

-- Insert videos with actual R2 URLs
INSERT INTO public.videos (
  id,
  user_id,
  title,
  description,
  prompt,
  triggers,
  category,
  status,
  credit_cost,
  duration,
  resolution,
  thumbnail_url,
  preview_url,
  download_url,
  views_count,
  likes_count,
  shares_count,
  is_public,
  is_featured,
  generation_started_at,
  generation_completed_at,
  created_at,
  updated_at
) VALUES 
-- Honey Dripping ASMR
(
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  NULL, -- No specific user, these are system/featured videos
  'Honey Dripping',
  'Sweet honey dripping ASMR with golden visuals',
  'Create a relaxing ASMR video featuring golden honey slowly dripping with mesmerizing visuals',
  ARRAY['honey', 'dripping', 'sweet'],
  'Object',
  'ready',
  0, -- No credit cost for sample videos
  '4:25',
  '1080p',
  'https://pub-a0da9daa5c8a415793ac89043f791f12.r2.dev/thumbnails/thumbnail-Honey Dripping-1755053009500-ze5ex5.jpg',
  'https://pub-a0da9daa5c8a415793ac89043f791f12.r2.dev/videos/video-Honey Dripping-1755053009500-six44h.mp4',
  'https://pub-a0da9daa5c8a415793ac89043f791f12.r2.dev/videos/video-Honey Dripping-1755053009500-six44h.mp4',
  15200,
  1800,
  0,
  true,
  true,
  NOW() - INTERVAL '1 hour',
  NOW() - INTERVAL '55 minutes',
  NOW() - INTERVAL '1 hour',
  NOW()
),

-- Ice Crushing ASMR
(
  'f47ac10b-58cc-4372-a567-0e02b2c3d480',
  NULL,
  'Ice Crushing',
  'Satisfying ice crushing and breaking sounds',
  'Generate an ASMR video with satisfying ice crushing and breaking sounds with crisp visuals',
  ARRAY['ice', 'crushing', 'breaking'],
  'Ice',
  'ready',
  0,
  '2:58',
  '1080p',
  'https://pub-a0da9daa5c8a415793ac89043f791f12.r2.dev/thumbnails/thumbnail-Ice Crushing-1755053014121-ejgufi.jpg',
  'https://pub-a0da9daa5c8a415793ac89043f791f12.r2.dev/videos/video-Ice Crushing-1755053014121-spq0f3.mp4',
  'https://pub-a0da9daa5c8a415793ac89043f791f12.r2.dev/videos/video-Ice Crushing-1755053014121-spq0f3.mp4',
  11700,
  1100,
  0,
  true,
  true,
  NOW() - INTERVAL '1 hour',
  NOW() - INTERVAL '55 minutes',
  NOW() - INTERVAL '1 hour',
  NOW()
),

-- Page Turning ASMR
(
  'f47ac10b-58cc-4372-a567-0e02b2c3d481',
  NULL,
  'Page Turning',
  'Gentle page turning sounds from vintage books',
  'Create an ASMR video with gentle page turning sounds from old vintage books',
  ARRAY['pages', 'turning', 'books'],
  'Pages',
  'ready',
  0,
  '6:12',
  '1080p',
  'https://pub-a0da9daa5c8a415793ac89043f791f12.r2.dev/thumbnails/thumbnail-Page Turning-1755053018541-m8a4t3.jpg',
  'https://pub-a0da9daa5c8a415793ac89043f791f12.r2.dev/videos/video-Page Turning-1755053018541-x278su.mp4',
  'https://pub-a0da9daa5c8a415793ac89043f791f12.r2.dev/videos/video-Page Turning-1755053018541-x278su.mp4',
  7300,
  654,
  0,
  true,
  true,
  NOW() - INTERVAL '1 hour',
  NOW() - INTERVAL '55 minutes',
  NOW() - INTERVAL '1 hour',
  NOW()
),

-- Soap Cutting ASMR
(
  'f47ac10b-58cc-4372-a567-0e02b2c3d482',
  NULL,
  'Soap Cutting ASMR',
  'Satisfying soap cutting sounds with colorful soaps',
  'Generate an ASMR video featuring satisfying soap cutting with colorful soap bars',
  ARRAY['soap', 'cutting', 'satisfying'],
  'Cutting',
  'ready',
  0,
  '3:42',
  '1080p',
  'https://pub-a0da9daa5c8a415793ac89043f791f12.r2.dev/thumbnails/thumbnail-Soap Cutting ASMR-1755053021439-xs0t66.jpg',
  'https://pub-a0da9daa5c8a415793ac89043f791f12.r2.dev/videos/video-Soap Cutting ASMR-1755053021439-1qb6z5.mp4',
  'https://pub-a0da9daa5c8a415793ac89043f791f12.r2.dev/videos/video-Soap Cutting ASMR-1755053021439-1qb6z5.mp4',
  12500,
  1200,
  0,
  true,
  true,
  NOW() - INTERVAL '1 hour',
  NOW() - INTERVAL '55 minutes',
  NOW() - INTERVAL '1 hour',
  NOW()
),

-- Sponge Squeezing ASMR
(
  'f47ac10b-58cc-4372-a567-0e02b2c3d483',
  NULL,
  'Sponge Squeezing',
  'Colorful sponge squeezing with water sounds',
  'Create an ASMR video with colorful sponge squeezing and water sounds',
  ARRAY['sponge', 'squeezing', 'water'],
  'Sponge',
  'ready',
  0,
  '4:33',
  '1080p',
  'https://pub-a0da9daa5c8a415793ac89043f791f12.r2.dev/thumbnails/thumbnail-Sponge Squeezing-1755053025168-wj4vfl.jpg',
  'https://pub-a0da9daa5c8a415793ac89043f791f12.r2.dev/videos/video-Sponge Squeezing-1755053025168-u6w4z4.mp4',
  'https://pub-a0da9daa5c8a415793ac89043f791f12.r2.dev/videos/video-Sponge Squeezing-1755053025168-u6w4z4.mp4',
  9800,
  967,
  0,
  true,
  true,
  NOW() - INTERVAL '1 hour',
  NOW() - INTERVAL '55 minutes',
  NOW() - INTERVAL '1 hour',
  NOW()
),

-- Water Droplets ASMR
(
  'f47ac10b-58cc-4372-a567-0e02b2c3d484',
  NULL,
  'Water Droplets',
  'Relaxing water droplet sounds on different surfaces',
  'Generate an ASMR video with relaxing water droplet sounds on various surfaces',
  ARRAY['water', 'droplets', 'relaxing'],
  'Water',
  'ready',
  0,
  '5:18',
  '1080p',
  'https://pub-a0da9daa5c8a415793ac89043f791f12.r2.dev/thumbnails/thumbnail-Water Droplets-1755053027738-2ri2pf.jpg',
  'https://pub-a0da9daa5c8a415793ac89043f791f12.r2.dev/videos/video-Water Droplets-1755053027738-q9s6zi.mp4',
  'https://pub-a0da9daa5c8a415793ac89043f791f12.r2.dev/videos/video-Water Droplets-1755053027738-q9s6zi.mp4',
  8900,
  892,
  0,
  true,
  true,
  NOW() - INTERVAL '1 hour',
  NOW() - INTERVAL '55 minutes',
  NOW() - INTERVAL '1 hour',
  NOW()
);

-- Optional: Update video counts for consistency
UPDATE public.videos 
SET updated_at = NOW() 
WHERE id IN (
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'f47ac10b-58cc-4372-a567-0e02b2c3d480',
  'f47ac10b-58cc-4372-a567-0e02b2c3d481',
  'f47ac10b-58cc-4372-a567-0e02b2c3d482',
  'f47ac10b-58cc-4372-a567-0e02b2c3d483',
  'f47ac10b-58cc-4372-a567-0e02b2c3d484'
);