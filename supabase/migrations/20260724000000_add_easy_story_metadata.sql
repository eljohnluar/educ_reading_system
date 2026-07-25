-- Map the assets already stored in stories/easy to their database record.
-- The reader can fall back to the Storage naming convention, but this record
-- supplies the title and keeps the story visible to metadata-based queries.
INSERT INTO public.story_metadata (
  level_id,
  story_id,
  title,
  file_path,
  audio_url,
  image_url,
  json_path,
  is_active
)
SELECT
  l.id,
  1,
  'Story 1',
  'easy/story_1.txt',
  'easy/story_1.mp3',
  'easy/story_1.jpg',
  'easy/story_1.json',
  true
FROM public.levels AS l
WHERE lower(l.level_name) = 'easy'
ON CONFLICT (level_id, story_id) DO UPDATE
SET
  file_path = EXCLUDED.file_path,
  audio_url = EXCLUDED.audio_url,
  image_url = EXCLUDED.image_url,
  json_path = EXCLUDED.json_path,
  is_active = true,
  updated_at = NOW();
