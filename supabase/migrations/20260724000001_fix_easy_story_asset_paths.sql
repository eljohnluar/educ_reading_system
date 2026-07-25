-- The objects uploaded to Storage are named `story_1.*` (with an underscore),
-- not `story 1.*`. Correct the metadata record if the earlier naming was used.
UPDATE public.story_metadata AS sm
SET
  file_path = 'easy/story_1.txt',
  audio_url = 'easy/story_1.mp3',
  image_url = 'easy/story_1.jpg',
  json_path = 'easy/story_1.json',
  updated_at = NOW()
FROM public.levels AS l
WHERE sm.level_id = l.id
  AND lower(l.level_name) = 'easy'
  AND sm.story_id = 1;
