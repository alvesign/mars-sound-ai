-- Mars Sound: RPCs, counter triggers, search, and analytics views.

CREATE OR REPLACE FUNCTION public.increment_play_count(p_track_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_status public.track_status;
  v_owner uuid;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  SELECT status, user_id
  INTO v_status, v_owner
  FROM public.tracks
  WHERE id = p_track_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'track not found';
  END IF;

  IF v_status IS DISTINCT FROM 'PUBLISHED' THEN
    RAISE EXCEPTION 'track is not published';
  END IF;

  UPDATE public.tracks
  SET play_count = play_count + 1
  WHERE id = p_track_id;

  UPDATE public.users
  SET total_plays = total_plays + 1
  WHERE id = v_owner;

  INSERT INTO public.play_history (user_id, track_id, played_at)
  VALUES (v_user, p_track_id, now());
END;
$$;

CREATE OR REPLACE FUNCTION public.add_track_to_playlist(p_playlist_id uuid, p_track_id uuid)
RETURNS public.playlist_tracks
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_owner uuid;
  v_status public.track_status;
  v_track_owner uuid;
  v_next integer;
  v_row public.playlist_tracks;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  SELECT user_id INTO v_owner
  FROM public.playlists
  WHERE id = p_playlist_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'playlist not found';
  END IF;

  IF v_owner IS DISTINCT FROM v_user THEN
    RAISE EXCEPTION 'not playlist owner';
  END IF;

  SELECT status, user_id
  INTO v_status, v_track_owner
  FROM public.tracks
  WHERE id = p_track_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'track not found';
  END IF;

  IF v_status IS DISTINCT FROM 'PUBLISHED' AND v_track_owner IS DISTINCT FROM v_user THEN
    RAISE EXCEPTION 'cannot add this track';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.playlist_tracks
    WHERE playlist_id = p_playlist_id
      AND track_id = p_track_id
  ) THEN
    RAISE EXCEPTION 'track already in playlist';
  END IF;

  SELECT COALESCE(MAX(position), 0) + 1
  INTO v_next
  FROM public.playlist_tracks
  WHERE playlist_id = p_playlist_id;

  INSERT INTO public.playlist_tracks (playlist_id, track_id, position, added_by)
  VALUES (p_playlist_id, p_track_id, v_next, v_user)
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

REVOKE ALL ON FUNCTION public.increment_play_count(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.add_track_to_playlist(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_play_count(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_track_to_playlist(uuid, uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.update_like_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.tracks
    SET like_count = like_count + 1
    WHERE id = NEW.track_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.tracks
    SET like_count = GREATEST(like_count - 1, 0)
    WHERE id = OLD.track_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER track_like_count_trigger
AFTER INSERT OR DELETE ON public.likes
FOR EACH ROW
EXECUTE FUNCTION public.update_like_count();

CREATE OR REPLACE FUNCTION public.update_follower_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.users
    SET total_followers = total_followers + 1
    WHERE id = NEW.following_id;

    UPDATE public.users
    SET total_following = total_following + 1
    WHERE id = NEW.follower_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.users
    SET total_followers = GREATEST(total_followers - 1, 0)
    WHERE id = OLD.following_id;

    UPDATE public.users
    SET total_following = GREATEST(total_following - 1, 0)
    WHERE id = OLD.follower_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER user_follow_count_trigger
AFTER INSERT OR DELETE ON public.follows
FOR EACH ROW
EXECUTE FUNCTION public.update_follower_count();

CREATE OR REPLACE FUNCTION public.update_user_track_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := COALESCE(NEW.user_id, OLD.user_id);
BEGIN
  UPDATE public.users
  SET total_tracks = (
    SELECT count(*)::integer
    FROM public.tracks
    WHERE user_id = v_user
  )
  WHERE id = v_user;
  RETURN NULL;
END;
$$;

CREATE TRIGGER user_track_count_trigger
AFTER INSERT OR DELETE ON public.tracks
FOR EACH ROW
EXECUTE FUNCTION public.update_user_track_count();

CREATE OR REPLACE FUNCTION public.update_playlist_track_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_playlist uuid := COALESCE(NEW.playlist_id, OLD.playlist_id);
BEGIN
  UPDATE public.playlists
  SET
    track_count = (
      SELECT count(*)::integer
      FROM public.playlist_tracks
      WHERE playlist_id = v_playlist
    ),
    total_duration = (
      SELECT COALESCE(sum(tracks.duration), 0)::integer
      FROM public.playlist_tracks
      JOIN public.tracks ON tracks.id = playlist_tracks.track_id
      WHERE playlist_tracks.playlist_id = v_playlist
    )
  WHERE id = v_playlist;
  RETURN NULL;
END;
$$;

CREATE TRIGGER playlist_track_count_trigger
AFTER INSERT OR DELETE ON public.playlist_tracks
FOR EACH ROW
EXECUTE FUNCTION public.update_playlist_track_count();

CREATE OR REPLACE FUNCTION public.create_follow_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_name text;
BEGIN
  SELECT name INTO v_name FROM public.users WHERE id = NEW.follower_id;

  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    actor_id,
    entity_id,
    entity_type
  )
  VALUES (
    NEW.following_id,
    'FOLLOW',
    'Novo seguidor',
    COALESCE(v_name, 'Alguém') || ' começou a seguir você',
    NEW.follower_id,
    NEW.follower_id,
    'user'
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER follow_notification_trigger
AFTER INSERT ON public.follows
FOR EACH ROW
EXECUTE FUNCTION public.create_follow_notification();

CREATE OR REPLACE FUNCTION public.create_like_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner uuid;
  v_title text;
  v_name text;
BEGIN
  SELECT user_id, title INTO v_owner, v_title
  FROM public.tracks
  WHERE id = NEW.track_id;

  IF v_owner IS NULL OR v_owner = NEW.user_id THEN
    RETURN NEW;
  END IF;

  SELECT name INTO v_name FROM public.users WHERE id = NEW.user_id;

  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    actor_id,
    entity_id,
    entity_type
  )
  VALUES (
    v_owner,
    'LIKE',
    'Nova curtida',
    COALESCE(v_name, 'Alguém') || ' curtiu sua música ' || COALESCE(v_title, ''),
    NEW.user_id,
    NEW.track_id,
    'track'
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER like_notification_trigger
AFTER INSERT ON public.likes
FOR EACH ROW
EXECUTE FUNCTION public.create_like_notification();

CREATE OR REPLACE FUNCTION public.search_tracks(search_query text)
RETURNS TABLE (
  id uuid,
  title text,
  artist text,
  relevance real
)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id,
    t.title,
    t.artist,
    ts_rank(
      to_tsvector('simple', t.title || ' ' || t.artist || ' ' || COALESCE(t.album, '')),
      plainto_tsquery('simple', search_query)
    ) AS relevance
  FROM public.tracks t
  WHERE
    t.status = 'PUBLISHED'
    AND to_tsvector('simple', t.title || ' ' || t.artist || ' ' || COALESCE(t.album, ''))
      @@ plainto_tsquery('simple', search_query)
  ORDER BY relevance DESC
  LIMIT 50;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_recommendations(
  p_user_id uuid,
  p_limit integer DEFAULT 20
)
RETURNS TABLE (
  id uuid,
  title text,
  artist text,
  image_url text,
  play_count integer
)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id,
    t.title,
    t.artist,
    t.image_url,
    t.play_count
  FROM public.tracks t
  JOIN public.genres g ON g.id = t.genre_id
  WHERE
    t.status = 'PUBLISHED'
    AND t.user_id <> p_user_id
    AND g.slug = ANY (
      SELECT unnest(favorite_genres)
      FROM public.users
      WHERE users.id = p_user_id
    )
  ORDER BY t.play_count DESC, t.created_at DESC
  LIMIT p_limit;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_top_tracks_this_week(p_limit integer DEFAULT 20)
RETURNS TABLE (
  id uuid,
  title text,
  artist text,
  image_url text,
  play_count bigint
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  RETURN QUERY
  SELECT
    t.id,
    t.title,
    t.artist,
    t.image_url,
    COUNT(ph.id) AS play_count
  FROM public.tracks t
  LEFT JOIN public.play_history ph
    ON t.id = ph.track_id
    AND ph.played_at >= now() - interval '7 days'
  WHERE t.status = 'PUBLISHED'
  GROUP BY t.id, t.title, t.artist, t.image_url
  ORDER BY play_count DESC, t.created_at DESC
  LIMIT p_limit;
END;
$$;

REVOKE ALL ON FUNCTION public.search_tracks(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_recommendations(uuid, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_top_tracks_this_week(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.search_tracks(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_recommendations(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_top_tracks_this_week(integer) TO authenticated;

CREATE VIEW public.top_tracks_this_month
WITH (security_invoker = true) AS
SELECT
  t.id,
  t.title,
  t.artist,
  COUNT(ph.id) AS play_count
FROM public.tracks t
LEFT JOIN public.play_history ph ON t.id = ph.track_id
WHERE ph.played_at >= date_trunc('month', now())
GROUP BY t.id, t.title, t.artist
ORDER BY play_count DESC
LIMIT 100;

CREATE VIEW public.top_users_this_week
WITH (security_invoker = true) AS
SELECT
  u.id,
  u.username,
  u.name,
  COUNT(ph.id) AS total_plays
FROM public.users u
LEFT JOIN public.play_history ph ON u.id = ph.user_id
WHERE ph.played_at >= now() - interval '7 days'
GROUP BY u.id, u.username, u.name
ORDER BY total_plays DESC
LIMIT 50;

CREATE VIEW public.genre_stats
WITH (security_invoker = true) AS
SELECT
  g.name,
  COUNT(DISTINCT t.id) AS track_count,
  COALESCE(SUM(t.play_count), 0) AS total_plays
FROM public.genres g
LEFT JOIN public.tracks t ON g.id = t.genre_id AND t.status = 'PUBLISHED'
GROUP BY g.id, g.name
ORDER BY total_plays DESC;

GRANT SELECT ON public.top_tracks_this_month, public.top_users_this_week, public.genre_stats TO anon, authenticated, service_role;

REVOKE ALL ON FUNCTION public.create_follow_notification() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.create_like_notification() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_follower_count() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_like_count() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_playlist_track_count() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_user_track_count() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION public.increment_play_count(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.add_track_to_playlist(uuid, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_top_tracks_this_week(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.increment_play_count(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_track_to_playlist(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_top_tracks_this_week(integer) TO authenticated;
