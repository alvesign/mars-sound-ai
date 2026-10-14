-- Close internal security definer functions. RPCs stay available to signed-in users.

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
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
