-- Mars Sound controlled seed. The auth user is created separately.

INSERT INTO public.genres (name, slug, color, description)
VALUES
  ('Ambient', 'ambient', '#4A90E2', 'Atmospheric and relaxing soundscapes'),
  ('Pop', 'pop', '#FF6B9D', 'Catchy and mainstream music'),
  ('Rock', 'rock', '#E74C3C', 'Energetic guitar-driven music'),
  ('Gospel', 'gospel', '#F39C12', 'Spiritual and uplifting music'),
  ('Samba', 'samba', '#1ABC9C', 'Brazilian rhythmic music'),
  ('Clássica', 'classica', '#9B59B6', 'Orchestral and timeless compositions'),
  ('Jazz', 'jazz', '#3498DB', 'Improvisational and sophisticated'),
  ('Blues', 'blues', '#34495E', 'Soulful and emotional'),
  ('Country', 'country', '#E67E22', 'American folk music'),
  ('Reggae', 'reggae', '#27AE60', 'Jamaican rhythm and vibes'),
  ('Hip-hop', 'hip-hop', '#E74C3C', 'Urban beats and rap'),
  ('Electronic', 'electronic', '#8E44AD', 'Synthesized and digital sounds'),
  ('Metal', 'metal', '#2C3E50', 'Heavy and aggressive'),
  ('Opera', 'opera', '#C0392B', 'Classical vocal performance')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.tags (name, slug)
VALUES
  ('chill', 'chill'),
  ('energetic', 'energetic'),
  ('romantic', 'romantic'),
  ('sad', 'sad'),
  ('happy', 'happy'),
  ('workout', 'workout'),
  ('focus', 'focus'),
  ('sleep', 'sleep'),
  ('party', 'party'),
  ('meditation', 'meditation')
ON CONFLICT (slug) DO NOTHING;

DO $$
DECLARE
  v_user uuid;
  v_audio text := 'https://framerusercontent.com/assets/09hPgrhAGuCOXh9suukXzyi8k.mp3';
BEGIN
  SELECT id INTO v_user
  FROM public.users
  WHERE username = 'demo_user';

  IF v_user IS NULL THEN
    RAISE EXCEPTION 'demo_user must exist before the content seed';
  END IF;

  UPDATE public.users
  SET
    name = 'Mars Demo',
    bio = 'AI Music Creator | Exploring the future of sound',
    avatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80',
    is_public = true,
    favorite_genres = ARRAY['ambient', 'electronic', 'jazz']::varchar(50)[],
    favorite_moods = ARRAY['chill', 'focus', 'energetic']::varchar(50)[]
  WHERE id = v_user;

  INSERT INTO public.tracks (
    title, description, audio_url, image_url, duration, file_size, format, bitrate, sample_rate,
    artist, album, genre_id, moods, ai_model, ai_prompt, status, user_id, published_at
  )
  SELECT
    seed.title,
    seed.description,
    v_audio,
    seed.image_url,
    seed.duration,
    seed.file_size,
    'mp3',
    320,
    44100,
    seed.artist,
    seed.album,
    genres.id,
    seed.moods,
    'MusicGen',
    seed.ai_prompt,
    'PUBLISHED'::public.track_status,
    v_user,
    now()
  FROM (
    VALUES
      ('Synthwave Dreams', 'Neon pulse and late-night drive.', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80', 212, 4980000, 'SynthMasterAI', 'Electronic', 'electronic', ARRAY['energetic', 'party']::varchar(50)[], 'Night drive synthwave with warm analog bass'),
      ('AI Serenade', 'A slow melody written for a quiet room.', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80', 198, 4620000, 'MelodyMaker', 'Rock', 'rock', ARRAY['romantic']::varchar(50)[], 'Intimate rock ballad with soft electric guitar'),
      ('Whispers of the Future', 'Voices and pads moving in long arcs.', 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80', 245, 5710000, 'FutureSound', 'Gospel', 'gospel', ARRAY['meditation']::varchar(50)[], 'Uplifting gospel choir over a gentle pulse'),
      ('Digital Echo', 'A bright loop that keeps circling back.', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=800&q=80', 187, 4360000, 'EchoAI', 'Electronic', 'electronic', ARRAY['focus', 'energetic']::varchar(50)[], 'Clean electronic loop with glassy echoes'),
      ('Neon Nights', 'Percussion made for a warm dance floor.', 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=800&q=80', 223, 5200000, 'NeonCreator', 'Samba', 'samba', ARRAY['party', 'happy']::varchar(50)[], 'Samba groove with neon synth stabs'),
      ('Cosmic Dreams', 'An ethereal journey through open space.', 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=800&q=80', 256, 5980000, 'Mars AI', 'Ambient', 'ambient', ARRAY['chill', 'meditation']::varchar(50)[], 'Relaxing ambient track with space vibes'),
      ('Binary Symphony', 'Strings arranged like a careful algorithm.', 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?auto=format&fit=crop&w=800&q=80', 241, 5620000, 'CodeComposer', 'Clássica', 'classica', ARRAY['focus']::varchar(50)[], 'Chamber strings with a precise modern pulse'),
      ('Voltage Vibes', 'A late set with room to breathe.', 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?auto=format&fit=crop&w=800&q=80', 208, 4860000, 'EmotionEngine', 'Jazz', 'jazz', ARRAY['chill']::varchar(50)[], 'Late-night jazz keys over a soft drum machine')
  ) AS seed(title, description, image_url, duration, file_size, artist, album, genre_slug, moods, ai_prompt)
  JOIN public.genres ON genres.slug = seed.genre_slug
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.tracks
    WHERE tracks.user_id = v_user
      AND tracks.title = seed.title
  );

  INSERT INTO public.track_tags (track_id, tag_id)
  SELECT tracks.id, tags.id
  FROM public.tracks
  JOIN public.tags ON tags.slug = CASE tracks.title
    WHEN 'Synthwave Dreams' THEN 'energetic'
    WHEN 'AI Serenade' THEN 'romantic'
    WHEN 'Whispers of the Future' THEN 'meditation'
    WHEN 'Digital Echo' THEN 'focus'
    WHEN 'Neon Nights' THEN 'party'
    WHEN 'Cosmic Dreams' THEN 'chill'
    WHEN 'Binary Symphony' THEN 'focus'
    WHEN 'Voltage Vibes' THEN 'chill'
  END
  WHERE tracks.user_id = v_user
    AND NOT EXISTS (
      SELECT 1
      FROM public.track_tags
      WHERE track_tags.track_id = tracks.id
        AND track_tags.tag_id = tags.id
    );

  INSERT INTO public.playlists (name, description, cover_image, visibility, user_id)
  SELECT
    seed.name,
    seed.description,
    seed.cover_image,
    'PUBLIC'::public.playlist_visibility,
    v_user
  FROM (
    VALUES
      ('Favoritas', 'As faixas que ficam no repeat.', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80'),
      ('Descobertas', 'Sons novos para ouvir com calma.', 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=800&q=80')
  ) AS seed(name, description, cover_image)
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.playlists
    WHERE playlists.user_id = v_user
      AND playlists.name = seed.name
  );

  INSERT INTO public.playlist_tracks (playlist_id, track_id, position, added_by)
  SELECT playlists.id, tracks.id, seed.position, v_user
  FROM (
    VALUES
      ('Favoritas', 'Synthwave Dreams', 1),
      ('Favoritas', 'AI Serenade', 2),
      ('Favoritas', 'Whispers of the Future', 3),
      ('Favoritas', 'Digital Echo', 4)
  ) AS seed(playlist_name, track_title, position)
  JOIN public.playlists
    ON playlists.user_id = v_user
    AND playlists.name = seed.playlist_name
  JOIN public.tracks
    ON tracks.user_id = v_user
    AND tracks.title = seed.track_title
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.playlist_tracks
    WHERE playlist_tracks.playlist_id = playlists.id
      AND playlist_tracks.track_id = tracks.id
  );
END $$;
