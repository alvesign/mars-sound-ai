-- Mars Sound: row level security. No open insert on notifications.

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.play_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.track_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view public profiles or their own"
  ON public.users
  FOR SELECT
  USING (
    is_public = true
    OR id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM public.follows
      WHERE follower_id = auth.uid()
        AND following_id = users.id
    )
  );

CREATE POLICY "Users can update their own profile"
  ON public.users
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can delete their own account"
  ON public.users
  FOR DELETE
  USING (id = auth.uid());

CREATE POLICY "Anyone can view genres"
  ON public.genres
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view tags"
  ON public.tags
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view published tracks"
  ON public.tracks
  FOR SELECT
  USING (
    status = 'PUBLISHED'
    OR user_id = auth.uid()
  );

CREATE POLICY "Authenticated users can create tracks"
  ON public.tracks
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Users can update their own tracks"
  ON public.tracks
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own tracks"
  ON public.tracks
  FOR DELETE
  USING (user_id = auth.uid());

CREATE POLICY "Admins can do everything with tracks"
  ON public.tracks
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM public.users
      WHERE id = auth.uid()
        AND role IN ('ADMIN', 'MODERATOR')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.users
      WHERE id = auth.uid()
        AND role IN ('ADMIN', 'MODERATOR')
    )
  );

CREATE POLICY "Users can view public playlists or their own"
  ON public.playlists
  FOR SELECT
  USING (
    visibility = 'PUBLIC'
    OR user_id = auth.uid()
  );

CREATE POLICY "Authenticated users can create playlists"
  ON public.playlists
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Users can update their own playlists"
  ON public.playlists
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own playlists"
  ON public.playlists
  FOR DELETE
  USING (user_id = auth.uid());

CREATE POLICY "Users can view tracks of visible playlists"
  ON public.playlist_tracks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.playlists
      WHERE playlists.id = playlist_tracks.playlist_id
        AND (
          playlists.visibility = 'PUBLIC'
          OR playlists.user_id = auth.uid()
        )
    )
  );

CREATE POLICY "Owners can add playlist tracks"
  ON public.playlist_tracks
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.playlists
      WHERE playlists.id = playlist_tracks.playlist_id
        AND playlists.user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can update playlist tracks"
  ON public.playlist_tracks
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.playlists
      WHERE playlists.id = playlist_tracks.playlist_id
        AND playlists.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.playlists
      WHERE playlists.id = playlist_tracks.playlist_id
        AND playlists.user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can remove playlist tracks"
  ON public.playlist_tracks
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.playlists
      WHERE playlists.id = playlist_tracks.playlist_id
        AND playlists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own favorites"
  ON public.favorites
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can add favorites"
  ON public.favorites
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove favorites"
  ON public.favorites
  FOR DELETE
  USING (user_id = auth.uid());

CREATE POLICY "Users can view their own likes"
  ON public.likes
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can add likes"
  ON public.likes
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove likes"
  ON public.likes
  FOR DELETE
  USING (user_id = auth.uid());

CREATE POLICY "Users can view their follows"
  ON public.follows
  FOR SELECT
  USING (
    follower_id = auth.uid()
    OR following_id = auth.uid()
  );

CREATE POLICY "Users can follow others"
  ON public.follows
  FOR INSERT
  WITH CHECK (
    follower_id = auth.uid()
    AND following_id <> auth.uid()
  );

CREATE POLICY "Users can unfollow"
  ON public.follows
  FOR DELETE
  USING (follower_id = auth.uid());

CREATE POLICY "Anyone can view comments on public tracks"
  ON public.comments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.tracks
      WHERE tracks.id = comments.track_id
        AND tracks.status = 'PUBLISHED'
    )
    OR user_id = auth.uid()
  );

CREATE POLICY "Authenticated users can comment"
  ON public.comments
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Users can update their own comments"
  ON public.comments
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own comments"
  ON public.comments
  FOR DELETE
  USING (user_id = auth.uid());

CREATE POLICY "Users can view their own play history"
  ON public.play_history
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own play history"
  ON public.play_history
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their own notifications"
  ON public.notifications
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their notifications"
  ON public.notifications
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Anyone can view tags of visible tracks"
  ON public.track_tags
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.tracks
      WHERE tracks.id = track_tags.track_id
        AND (
          tracks.status = 'PUBLISHED'
          OR tracks.user_id = auth.uid()
        )
    )
  );

CREATE POLICY "Owners can tag their tracks"
  ON public.track_tags
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.tracks
      WHERE tracks.id = track_tags.track_id
        AND tracks.user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can untag their tracks"
  ON public.track_tags
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.tracks
      WHERE tracks.id = track_tags.track_id
        AND tracks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own reports"
  ON public.reports
  FOR SELECT
  USING (reporter_id = auth.uid());

CREATE POLICY "Users can create their own reports"
  ON public.reports
  FOR INSERT
  WITH CHECK (reporter_id = auth.uid());

CREATE POLICY "Audit logs are closed to clients"
  ON public.audit_logs
  FOR ALL
  USING (false)
  WITH CHECK (false);
