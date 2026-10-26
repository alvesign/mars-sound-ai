-- Harden public profile creation for Google OAuth metadata
-- (full_name / picture in addition to name / avatar_url).

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_username text;
  v_name text;
  v_avatar text;
BEGIN
  v_username := NULLIF(trim(COALESCE(NEW.raw_user_meta_data->>'username', '')), '');
  v_name := NULLIF(
    trim(
      COALESCE(
        NEW.raw_user_meta_data->>'name',
        NEW.raw_user_meta_data->>'full_name',
        ''
      )
    ),
    ''
  );
  v_avatar := NULLIF(
    trim(
      COALESCE(
        NEW.raw_user_meta_data->>'avatar_url',
        NEW.raw_user_meta_data->>'picture',
        ''
      )
    ),
    ''
  );

  IF v_username IS NULL THEN
    v_username := split_part(COALESCE(NEW.email, 'user'), '@', 1);
  END IF;

  IF v_name IS NULL THEN
    v_name := v_username;
  END IF;

  IF EXISTS (SELECT 1 FROM public.users WHERE username = v_username) THEN
    v_username := v_username || '_' || left(NEW.id::text, 8);
  END IF;

  INSERT INTO public.users (id, email, username, name, avatar)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, NEW.id::text || '@users.mars'),
    v_username,
    v_name,
    v_avatar
  );

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
