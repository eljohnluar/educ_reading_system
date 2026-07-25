-- Storage client paths must be relative to the selected `stories` bucket.
-- Existing records include the redundant `stories/` prefix, which made the
-- reader request `stories/stories/<level>/story_1.*` and receive a 400.
UPDATE public.story_metadata
SET
  file_path = regexp_replace(file_path, '^/?stories/', ''),
  audio_url = regexp_replace(audio_url, '^/?stories/', ''),
  image_url = regexp_replace(image_url, '^/?stories/', ''),
  json_path = regexp_replace(json_path, '^/?stories/', ''),
  updated_at = NOW()
WHERE file_path ~ '^/?stories/'
   OR audio_url ~ '^/?stories/'
   OR image_url ~ '^/?stories/'
   OR json_path ~ '^/?stories/';
