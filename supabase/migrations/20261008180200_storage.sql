-- Mars Sound: public storage buckets. Writes stay inside the caller's folder.

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('track-audio', 'track-audio', true),
  ('track-covers', 'track-covers', true),
  ('playlist-covers', 'playlist-covers', true),
  ('user-avatars', 'user-avatars', true),
  ('waveforms', 'waveforms', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read for Mars media"
  ON storage.objects
  FOR SELECT
  TO public
  USING (
    bucket_id IN (
      'track-audio',
      'track-covers',
      'playlist-covers',
      'user-avatars',
      'waveforms'
    )
  );

CREATE POLICY "Owners upload Mars media"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id IN (
      'track-audio',
      'track-covers',
      'playlist-covers',
      'user-avatars',
      'waveforms'
    )
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Owners update Mars media"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id IN (
      'track-audio',
      'track-covers',
      'playlist-covers',
      'user-avatars',
      'waveforms'
    )
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id IN (
      'track-audio',
      'track-covers',
      'playlist-covers',
      'user-avatars',
      'waveforms'
    )
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Owners delete Mars media"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id IN (
      'track-audio',
      'track-covers',
      'playlist-covers',
      'user-avatars',
      'waveforms'
    )
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
