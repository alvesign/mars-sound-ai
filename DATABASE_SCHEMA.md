# Mars Sound AI - Database Schema & Infrastructure

## Índice

1. [Visão Geral](#visão-geral)
2. [Schema Prisma Completo](#schema-prisma-completo)
3. [Row Level Security (RLS)](#row-level-security-rls)
4. [Database Functions](#database-functions)
5. [Triggers](#triggers)
6. [Indexes e Performance](#indexes-e-performance)
7. [Migrations](#migrations)
8. [Seed Data](#seed-data)

---

## Visão Geral

### Tecnologias

- **Database**: PostgreSQL 15+
- **ORM**: Prisma 5+
- **Storage**: Supabase Storage (áudio e imagens)
- **Auth**: Supabase Auth
- **Real-time**: Supabase Realtime (futuro)

### Estrutura de Tabelas

```
User
├── Track (1:N)
├── Playlist (1:N)
├── Favorite (N:M com Track)
├── Follow (N:M self-relation)
├── Comment (1:N) - futuro
└── PlayHistory (1:N)

Track
├── User (N:1)
├── Playlist (N:M via PlaylistTrack)
├── Favorite (N:M)
├── Genre (N:1)
├── Tag (N:M via TrackTag)
└── Comment (1:N) - futuro

Playlist
├── User (N:1)
├── Track (N:M via PlaylistTrack)
└── Follow (N:M) - futuro

Genre (lookup table)
Mood (lookup table)
Tag (lookup table)
```

---

## Schema Prisma Completo

### Arquivo: `prisma/schema.prisma`

```prisma
// ══════════════════════════════════════════════════════════
// Mars Sound AI - Database Schema
// ══════════════════════════════════════════════════════════

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["fullTextSearch", "fullTextIndex"]
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// ──────────────────────────────────────────────────────────
// ENUMS
// ──────────────────────────────────────────────────────────

enum UserRole {
  USER
  CREATOR
  ADMIN
  MODERATOR
}

enum TrackStatus {
  DRAFT
  PROCESSING
  PUBLISHED
  ARCHIVED
  REJECTED
}

enum PlaylistVisibility {
  PUBLIC
  PRIVATE
  UNLISTED
}

enum NotificationType {
  LIKE
  COMMENT
  FOLLOW
  PLAYLIST_ADD
  NEW_TRACK
  SYSTEM
}

// ──────────────────────────────────────────────────────────
// USER & AUTH
// ──────────────────────────────────────────────────────────

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  username  String   @unique
  name      String
  bio       String?  @db.Text
  avatar    String?
  coverImage String? @map("cover_image")
  
  // Settings
  role      UserRole @default(USER)
  isPublic  Boolean  @default(true) @map("is_public")
  isVerified Boolean @default(false) @map("is_verified")
  
  // Preferences
  favoriteGenres String[] @map("favorite_genres") @db.VarChar(50)
  favoriteMoods  String[] @map("favorite_moods") @db.VarChar(50)
  
  // Stats (denormalized for performance)
  totalTracks    Int @default(0) @map("total_tracks")
  totalPlays     Int @default(0) @map("total_plays")
  totalFollowers Int @default(0) @map("total_followers")
  totalFollowing Int @default(0) @map("total_following")
  
  // Timestamps
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  lastLoginAt DateTime? @map("last_login_at")
  
  // Relations
  tracks        Track[]
  playlists     Playlist[]
  favorites     Favorite[]
  playHistory   PlayHistory[]
  comments      Comment[]
  notifications Notification[] @relation("NotificationRecipient")
  
  // Followers & Following (self-relation)
  followers     Follow[] @relation("UserFollowers")
  following     Follow[] @relation("UserFollowing")
  
  // Likes
  likedTracks   Like[]
  
  @@index([username])
  @@index([email])
  @@index([createdAt])
  @@map("users")
}

// ──────────────────────────────────────────────────────────
// MUSIC CONTENT
// ──────────────────────────────────────────────────────────

model Track {
  id          String      @id @default(cuid())
  title       String
  description String?     @db.Text
  
  // Media URLs (Supabase Storage)
  audioUrl    String      @map("audio_url")
  imageUrl    String      @map("image_url")
  waveformUrl String?     @map("waveform_url") // Generated waveform image
  
  // Audio metadata
  duration    Int         // Duration in seconds
  fileSize    Int         @map("file_size") // In bytes
  format      String      @default("mp3") // mp3, wav, flac
  bitrate     Int?        // In kbps
  sampleRate  Int?        @map("sample_rate") // In Hz
  
  // Content metadata
  artist      String
  album       String?
  genreId     String      @map("genre_id")
  moods       String[]    @db.VarChar(50)
  
  // AI Generation info
  aiModel     String?     @map("ai_model") // e.g., "MusicGen", "Stable Audio"
  aiPrompt    String?     @map("ai_prompt") @db.Text
  aiSettings  Json?       @map("ai_settings") // JSON with generation parameters
  
  // Stats (denormalized)
  playCount   Int         @default(0) @map("play_count")
  likeCount   Int         @default(0) @map("like_count")
  commentCount Int        @default(0) @map("comment_count")
  shareCount  Int         @default(0) @map("share_count")
  
  // Status & visibility
  status      TrackStatus @default(DRAFT)
  isExplicit  Boolean     @default(false) @map("is_explicit")
  isDownloadable Boolean  @default(false) @map("is_downloadable")
  
  // Ownership
  userId      String      @map("user_id")
  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Timestamps
  publishedAt DateTime?   @map("published_at")
  createdAt   DateTime    @default(now()) @map("created_at")
  updatedAt   DateTime    @updatedAt @map("updated_at")
  
  // Relations
  genre       Genre       @relation(fields: [genreId], references: [id])
  tags        TrackTag[]
  playlists   PlaylistTrack[]
  favorites   Favorite[]
  playHistory PlayHistory[]
  comments    Comment[]
  likes       Like[]
  
  @@index([userId])
  @@index([genreId])
  @@index([status])
  @@index([publishedAt])
  @@index([playCount])
  @@index([createdAt])
  @@fulltext([title, artist, album])
  @@map("tracks")
}

// ──────────────────────────────────────────────────────────
// PLAYLISTS
// ──────────────────────────────────────────────────────────

model Playlist {
  id          String             @id @default(cuid())
  name        String
  description String?            @db.Text
  coverImage  String?            @map("cover_image")
  
  // Settings
  visibility  PlaylistVisibility @default(PUBLIC)
  isCollaborative Boolean        @default(false) @map("is_collaborative")
  
  // Stats
  trackCount  Int                @default(0) @map("track_count")
  totalDuration Int              @default(0) @map("total_duration") // In seconds
  followerCount Int              @default(0) @map("follower_count")
  
  // Ownership
  userId      String             @map("user_id")
  user        User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Timestamps
  createdAt   DateTime           @default(now()) @map("created_at")
  updatedAt   DateTime           @updatedAt @map("updated_at")
  
  // Relations
  tracks      PlaylistTrack[]
  
  @@index([userId])
  @@index([visibility])
  @@index([createdAt])
  @@fulltext([name, description])
  @@map("playlists")
}

// Junction table for Playlist <-> Track (many-to-many)
model PlaylistTrack {
  id         String   @id @default(cuid())
  playlistId String   @map("playlist_id")
  trackId    String   @map("track_id")
  position   Int      // Order in playlist
  addedAt    DateTime @default(now()) @map("added_at")
  addedBy    String?  @map("added_by") // User ID who added (for collaborative playlists)
  
  playlist   Playlist @relation(fields: [playlistId], references: [id], onDelete: Cascade)
  track      Track    @relation(fields: [trackId], references: [id], onDelete: Cascade)
  
  @@unique([playlistId, trackId])
  @@index([playlistId])
  @@index([trackId])
  @@index([position])
  @@map("playlist_tracks")
}

// ──────────────────────────────────────────────────────────
// FAVORITES
// ──────────────────────────────────────────────────────────

model Favorite {
  id        String   @id @default(cuid())
  userId    String   @map("user_id")
  trackId   String   @map("track_id")
  createdAt DateTime @default(now()) @map("created_at")
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  track     Track    @relation(fields: [trackId], references: [id], onDelete: Cascade)
  
  @@unique([userId, trackId])
  @@index([userId])
  @@index([trackId])
  @@index([createdAt])
  @@map("favorites")
}

// ──────────────────────────────────────────────────────────
// LIKES
// ──────────────────────────────────────────────────────────

model Like {
  id        String   @id @default(cuid())
  userId    String   @map("user_id")
  trackId   String   @map("track_id")
  createdAt DateTime @default(now()) @map("created_at")
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  track     Track    @relation(fields: [trackId], references: [id], onDelete: Cascade)
  
  @@unique([userId, trackId])
  @@index([userId])
  @@index([trackId])
  @@index([createdAt])
  @@map("likes")
}

// ──────────────────────────────────────────────────────────
// SOCIAL FEATURES
// ──────────────────────────────────────────────────────────

model Follow {
  id          String   @id @default(cuid())
  followerId  String   @map("follower_id")
  followingId String   @map("following_id")
  createdAt   DateTime @default(now()) @map("created_at")
  
  follower    User     @relation("UserFollowers", fields: [followerId], references: [id], onDelete: Cascade)
  following   User     @relation("UserFollowing", fields: [followingId], references: [id], onDelete: Cascade)
  
  @@unique([followerId, followingId])
  @@index([followerId])
  @@index([followingId])
  @@index([createdAt])
  @@map("follows")
}

model Comment {
  id        String   @id @default(cuid())
  content   String   @db.Text
  
  // Relations
  userId    String   @map("user_id")
  trackId   String   @map("track_id")
  parentId  String?  @map("parent_id") // For nested comments
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  track     Track    @relation(fields: [trackId], references: [id], onDelete: Cascade)
  parent    Comment? @relation("CommentReplies", fields: [parentId], references: [id], onDelete: Cascade)
  replies   Comment[] @relation("CommentReplies")
  
  // Timestamps
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  
  @@index([userId])
  @@index([trackId])
  @@index([parentId])
  @@index([createdAt])
  @@map("comments")
}

// ──────────────────────────────────────────────────────────
// ANALYTICS & HISTORY
// ──────────────────────────────────────────────────────────

model PlayHistory {
  id         String   @id @default(cuid())
  userId     String   @map("user_id")
  trackId    String   @map("track_id")
  playedAt   DateTime @default(now()) @map("played_at")
  
  // Playback info
  duration   Int?     // How long the user listened (in seconds)
  completed  Boolean  @default(false) // Did they finish the track?
  
  // Context
  source     String?  // "home", "discover", "playlist", "search", etc.
  playlistId String?  @map("playlist_id") // If played from playlist
  
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  track      Track    @relation(fields: [trackId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([trackId])
  @@index([playedAt])
  @@map("play_history")
}

// ──────────────────────────────────────────────────────────
// NOTIFICATIONS
// ──────────────────────────────────────────────────────────

model Notification {
  id        String           @id @default(cuid())
  type      NotificationType
  title     String
  message   String           @db.Text
  
  // Target
  userId    String           @map("user_id")
  user      User             @relation("NotificationRecipient", fields: [userId], references: [id], onDelete: Cascade)
  
  // Context
  actorId   String?          @map("actor_id") // User who triggered the notification
  entityId  String?          @map("entity_id") // Track, Playlist, Comment ID
  entityType String?         @map("entity_type") // "track", "playlist", "comment"
  
  // Status
  isRead    Boolean          @default(false) @map("is_read")
  readAt    DateTime?        @map("read_at")
  
  // Timestamps
  createdAt DateTime         @default(now()) @map("created_at")
  
  @@index([userId])
  @@index([isRead])
  @@index([createdAt])
  @@map("notifications")
}

// ──────────────────────────────────────────────────────────
// LOOKUP TABLES
// ──────────────────────────────────────────────────────────

model Genre {
  id          String   @id @default(cuid())
  name        String   @unique
  slug        String   @unique
  description String?  @db.Text
  image       String?
  color       String?  // Hex color for UI
  
  tracks      Track[]
  
  createdAt   DateTime @default(now()) @map("created_at")
  
  @@index([slug])
  @@map("genres")
}

model Tag {
  id        String     @id @default(cuid())
  name      String     @unique
  slug      String     @unique
  
  tracks    TrackTag[]
  
  createdAt DateTime   @default(now()) @map("created_at")
  
  @@index([slug])
  @@map("tags")
}

// Junction table for Track <-> Tag (many-to-many)
model TrackTag {
  id      String @id @default(cuid())
  trackId String @map("track_id")
  tagId   String @map("tag_id")
  
  track   Track  @relation(fields: [trackId], references: [id], onDelete: Cascade)
  tag     Tag    @relation(fields: [tagId], references: [id], onDelete: Cascade)
  
  @@unique([trackId, tagId])
  @@index([trackId])
  @@index([tagId])
  @@map("track_tags")
}

// ──────────────────────────────────────────────────────────
// SYSTEM & MODERATION
// ──────────────────────────────────────────────────────────

model Report {
  id          String   @id @default(cuid())
  reporterId  String   @map("reporter_id")
  entityId    String   @map("entity_id")
  entityType  String   @map("entity_type") // "track", "comment", "user"
  reason      String
  description String?  @db.Text
  status      String   @default("pending") // "pending", "reviewed", "resolved", "dismissed"
  
  createdAt   DateTime @default(now()) @map("created_at")
  resolvedAt  DateTime? @map("resolved_at")
  resolvedBy  String?  @map("resolved_by") // Admin user ID
  
  @@index([reporterId])
  @@index([entityId])
  @@index([status])
  @@index([createdAt])
  @@map("reports")
}

model AuditLog {
  id        String   @id @default(cuid())
  userId    String?  @map("user_id")
  action    String   // "create", "update", "delete", "login", etc.
  entity    String   // "user", "track", "playlist", etc.
  entityId  String?  @map("entity_id")
  metadata  Json?    // Additional context
  ipAddress String?  @map("ip_address")
  userAgent String?  @map("user_agent")
  
  createdAt DateTime @default(now()) @map("created_at")
  
  @@index([userId])
  @@index([action])
  @@index([entity])
  @@index([createdAt])
  @@map("audit_logs")
}
```

---

## Row Level Security (RLS)

### Ativação de RLS

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE play_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
```

---

### Políticas de Segurança

#### 1. **Users**

```sql
-- Users podem ver perfis públicos ou seu próprio perfil
CREATE POLICY "Users can view public profiles or their own"
  ON users FOR SELECT
  USING (
    is_public = true 
    OR id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM follows 
      WHERE follower_id = auth.uid() AND following_id = users.id
    )
  );

-- Users podem atualizar apenas seu próprio perfil
CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Apenas o próprio user pode deletar sua conta
CREATE POLICY "Users can delete their own account"
  ON users FOR DELETE
  USING (id = auth.uid());
```

---

#### 2. **Tracks**

```sql
-- Qualquer um pode ver tracks publicadas
CREATE POLICY "Anyone can view published tracks"
  ON tracks FOR SELECT
  USING (
    status = 'PUBLISHED'
    OR user_id = auth.uid()
  );

-- Users autenticados podem criar tracks
CREATE POLICY "Authenticated users can create tracks"
  ON tracks FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Users podem atualizar apenas suas próprias tracks
CREATE POLICY "Users can update their own tracks"
  ON tracks FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users podem deletar apenas suas próprias tracks
CREATE POLICY "Users can delete their own tracks"
  ON tracks FOR DELETE
  USING (user_id = auth.uid());

-- Admins podem ver e modificar tudo
CREATE POLICY "Admins can do everything with tracks"
  ON tracks
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('ADMIN', 'MODERATOR')
    )
  );
```

---

#### 3. **Playlists**

```sql
-- Users podem ver playlists públicas ou suas próprias
CREATE POLICY "Users can view public playlists or their own"
  ON playlists FOR SELECT
  USING (
    visibility = 'PUBLIC'
    OR user_id = auth.uid()
    OR (
      visibility = 'UNLISTED' 
      AND id IN (
        SELECT playlist_id FROM playlist_tracks
      )
    )
  );

-- Users autenticados podem criar playlists
CREATE POLICY "Authenticated users can create playlists"
  ON playlists FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Users podem atualizar suas próprias playlists
CREATE POLICY "Users can update their own playlists"
  ON playlists FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users podem deletar suas próprias playlists
CREATE POLICY "Users can delete their own playlists"
  ON playlists FOR DELETE
  USING (user_id = auth.uid());
```

---

#### 4. **Favorites & Likes**

```sql
-- Users podem ver apenas seus próprios favoritos
CREATE POLICY "Users can view their own favorites"
  ON favorites FOR SELECT
  USING (user_id = auth.uid());

-- Users podem adicionar aos favoritos
CREATE POLICY "Users can add favorites"
  ON favorites FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users podem remover dos favoritos
CREATE POLICY "Users can remove favorites"
  ON favorites FOR DELETE
  USING (user_id = auth.uid());

-- Same for Likes
CREATE POLICY "Users can view their own likes"
  ON likes FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can add likes"
  ON likes FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove likes"
  ON likes FOR DELETE
  USING (user_id = auth.uid());
```

---

#### 5. **Follows**

```sql
-- Users podem ver quem eles seguem e quem os segue
CREATE POLICY "Users can view their follows"
  ON follows FOR SELECT
  USING (
    follower_id = auth.uid() 
    OR following_id = auth.uid()
  );

-- Users podem seguir outros users
CREATE POLICY "Users can follow others"
  ON follows FOR INSERT
  WITH CHECK (follower_id = auth.uid());

-- Users podem deixar de seguir
CREATE POLICY "Users can unfollow"
  ON follows FOR DELETE
  USING (follower_id = auth.uid());
```

---

#### 6. **Comments**

```sql
-- Anyone pode ver comentários de tracks públicas
CREATE POLICY "Anyone can view comments on public tracks"
  ON comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tracks 
      WHERE id = comments.track_id AND status = 'PUBLISHED'
    )
  );

-- Users autenticados podem comentar
CREATE POLICY "Authenticated users can comment"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Users podem editar seus próprios comentários
CREATE POLICY "Users can update their own comments"
  ON comments FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users podem deletar seus próprios comentários
CREATE POLICY "Users can delete their own comments"
  ON comments FOR DELETE
  USING (user_id = auth.uid());
```

---

#### 7. **Play History**

```sql
-- Users podem ver apenas seu próprio histórico
CREATE POLICY "Users can view their own play history"
  ON play_history FOR SELECT
  USING (user_id = auth.uid());

-- Sistema pode registrar plays
CREATE POLICY "System can insert play history"
  ON play_history FOR INSERT
  WITH CHECK (user_id = auth.uid());
```

---

#### 8. **Notifications**

```sql
-- Users podem ver apenas suas próprias notificações
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

-- Users podem marcar como lida
CREATE POLICY "Users can update their notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Sistema pode criar notificações
CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);
```

---

## Database Functions

### 1. **Atualizar contador de plays**

```sql
CREATE OR REPLACE FUNCTION increment_play_count(track_id_param TEXT)
RETURNS void AS $$
BEGIN
  UPDATE tracks
  SET play_count = play_count + 1
  WHERE id = track_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Uso**:
```typescript
await prisma.$executeRaw`SELECT increment_play_count(${trackId})`;
```

---

### 2. **Atualizar contador de likes**

```sql
CREATE OR REPLACE FUNCTION update_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE tracks
    SET like_count = like_count + 1
    WHERE id = NEW.track_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE tracks
    SET like_count = like_count - 1
    WHERE id = OLD.track_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_like_count_trigger
AFTER INSERT OR DELETE ON likes
FOR EACH ROW
EXECUTE FUNCTION update_like_count();
```

---

### 3. **Atualizar contador de followers**

```sql
CREATE OR REPLACE FUNCTION update_follower_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment follower count
    UPDATE users
    SET total_followers = total_followers + 1
    WHERE id = NEW.following_id;
    
    -- Increment following count
    UPDATE users
    SET total_following = total_following + 1
    WHERE id = NEW.follower_id;
    
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement follower count
    UPDATE users
    SET total_followers = total_followers - 1
    WHERE id = OLD.following_id;
    
    -- Decrement following count
    UPDATE users
    SET total_following = total_following - 1
    WHERE id = OLD.follower_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_follow_count_trigger
AFTER INSERT OR DELETE ON follows
FOR EACH ROW
EXECUTE FUNCTION update_follower_count();
```

---

### 4. **Atualizar contador de tracks do user**

```sql
CREATE OR REPLACE FUNCTION update_user_track_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE users
    SET total_tracks = total_tracks + 1
    WHERE id = NEW.user_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE users
    SET total_tracks = total_tracks - 1
    WHERE id = OLD.user_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_track_count_trigger
AFTER INSERT OR DELETE ON tracks
FOR EACH ROW
EXECUTE FUNCTION update_user_track_count();
```

---

### 5. **Busca Full-Text**

```sql
CREATE OR REPLACE FUNCTION search_tracks(search_query TEXT)
RETURNS TABLE (
  id TEXT,
  title TEXT,
  artist TEXT,
  relevance REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.title,
    t.artist,
    ts_rank(
      to_tsvector('english', t.title || ' ' || t.artist || ' ' || COALESCE(t.album, '')),
      plainto_tsquery('english', search_query)
    ) AS relevance
  FROM tracks t
  WHERE 
    t.status = 'PUBLISHED'
    AND to_tsvector('english', t.title || ' ' || t.artist || ' ' || COALESCE(t.album, '')) 
    @@ plainto_tsquery('english', search_query)
  ORDER BY relevance DESC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql;
```

**Uso**:
```typescript
const results = await prisma.$queryRaw`SELECT * FROM search_tracks(${query})`;
```

---

### 6. **Recomendações baseadas em gênero**

```sql
CREATE OR REPLACE FUNCTION get_recommendations(
  user_id_param TEXT,
  limit_param INT DEFAULT 20
)
RETURNS TABLE (
  id TEXT,
  title TEXT,
  artist TEXT,
  image_url TEXT,
  play_count INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.title,
    t.artist,
    t.image_url,
    t.play_count
  FROM tracks t
  WHERE 
    t.status = 'PUBLISHED'
    AND t.genre_id IN (
      SELECT unnest(favorite_genres) 
      FROM users 
      WHERE id = user_id_param
    )
    AND t.user_id != user_id_param
  ORDER BY t.play_count DESC, t.created_at DESC
  LIMIT limit_param;
END;
$$ LANGUAGE plpgsql;
```

---

### 7. **Top músicas da semana**

```sql
CREATE OR REPLACE FUNCTION get_top_tracks_this_week(limit_param INT DEFAULT 20)
RETURNS TABLE (
  id TEXT,
  title TEXT,
  artist TEXT,
  image_url TEXT,
  play_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.title,
    t.artist,
    t.image_url,
    COUNT(ph.id) AS play_count
  FROM tracks t
  LEFT JOIN play_history ph ON t.id = ph.track_id
  WHERE 
    t.status = 'PUBLISHED'
    AND ph.played_at >= NOW() - INTERVAL '7 days'
  GROUP BY t.id, t.title, t.artist, t.image_url
  ORDER BY play_count DESC
  LIMIT limit_param;
END;
$$ LANGUAGE plpgsql;
```

---

## Triggers

### 1. **Auto-timestamp de updated_at**

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tracks_updated_at
  BEFORE UPDATE ON tracks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_playlists_updated_at
  BEFORE UPDATE ON playlists
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

### 2. **Auto-increment playlist track_count**

```sql
CREATE OR REPLACE FUNCTION update_playlist_track_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE playlists
    SET track_count = track_count + 1
    WHERE id = NEW.playlist_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE playlists
    SET track_count = track_count - 1
    WHERE id = OLD.playlist_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER playlist_track_count_trigger
AFTER INSERT OR DELETE ON playlist_tracks
FOR EACH ROW
EXECUTE FUNCTION update_playlist_track_count();
```

---

### 3. **Criar notificação quando seguir**

```sql
CREATE OR REPLACE FUNCTION create_follow_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    actor_id,
    entity_id,
    entity_type
  )
  SELECT
    NEW.following_id,
    'FOLLOW',
    'Novo seguidor',
    (SELECT name FROM users WHERE id = NEW.follower_id) || ' começou a seguir você',
    NEW.follower_id,
    NEW.follower_id,
    'user';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER follow_notification_trigger
AFTER INSERT ON follows
FOR EACH ROW
EXECUTE FUNCTION create_follow_notification();
```

---

### 4. **Criar notificação quando favoritar**

```sql
CREATE OR REPLACE FUNCTION create_like_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    actor_id,
    entity_id,
    entity_type
  )
  SELECT
    t.user_id,
    'LIKE',
    'Nova curtida',
    (SELECT name FROM users WHERE id = NEW.user_id) || ' curtiu sua música ' || t.title,
    NEW.user_id,
    NEW.track_id,
    'track'
  FROM tracks t
  WHERE t.id = NEW.track_id
    AND t.user_id != NEW.user_id; -- Don't notify self
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER like_notification_trigger
AFTER INSERT ON likes
FOR EACH ROW
EXECUTE FUNCTION create_like_notification();
```

---

## Indexes e Performance

### Indexes Compostos

```sql
-- Busca de tracks por user + status
CREATE INDEX idx_tracks_user_status ON tracks(user_id, status);

-- Busca de tracks por genre + status
CREATE INDEX idx_tracks_genre_status ON tracks(genre_id, status);

-- Ordenação de tracks por plays + data
CREATE INDEX idx_tracks_play_count_created ON tracks(play_count DESC, created_at DESC);

-- Busca de playlists por user + visibility
CREATE INDEX idx_playlists_user_visibility ON playlists(user_id, visibility);

-- Play history por user + data
CREATE INDEX idx_play_history_user_date ON play_history(user_id, played_at DESC);

-- Notificações não lidas
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read, created_at DESC);
```

---

### Índices Full-Text

```sql
-- Full-text search em tracks
CREATE INDEX idx_tracks_fulltext ON tracks 
USING GIN (to_tsvector('english', title || ' ' || artist || ' ' || COALESCE(album, '')));

-- Full-text search em playlists
CREATE INDEX idx_playlists_fulltext ON playlists 
USING GIN (to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Full-text search em users
CREATE INDEX idx_users_fulltext ON users 
USING GIN (to_tsvector('english', name || ' ' || username || ' ' || COALESCE(bio, '')));
```

---

## Migrations

### Setup Inicial

```bash
# Initialize Prisma
npx prisma init

# Create migration
npx prisma migrate dev --name init

# Generate client
npx prisma generate

# Deploy to production
npx prisma migrate deploy
```

---

### Migration para Adicionar RLS

```sql
-- migration: 20260326_enable_rls.sql

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
-- ... (todas as tabelas)

-- Add policies
-- ... (todas as políticas acima)
```

---

### Migration para Adicionar Triggers

```sql
-- migration: 20260326_add_triggers.sql

-- Create functions
-- ... (todas as functions acima)

-- Create triggers
-- ... (todos os triggers acima)
```

---

## Seed Data

### Arquivo: `prisma/seed.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ── Genres ──────────────────────────────────────────
  const genres = [
    { name: 'Ambient', slug: 'ambient', color: '#4A90E2', description: 'Atmospheric and relaxing soundscapes' },
    { name: 'Pop', slug: 'pop', color: '#FF6B9D', description: 'Catchy and mainstream music' },
    { name: 'Rock', slug: 'rock', color: '#E74C3C', description: 'Energetic guitar-driven music' },
    { name: 'Gospel', slug: 'gospel', color: '#F39C12', description: 'Spiritual and uplifting music' },
    { name: 'Samba', slug: 'samba', color: '#1ABC9C', description: 'Brazilian rhythmic music' },
    { name: 'Clássica', slug: 'classica', color: '#9B59B6', description: 'Orchestral and timeless compositions' },
    { name: 'Jazz', slug: 'jazz', color: '#3498DB', description: 'Improvisational and sophisticated' },
    { name: 'Blues', slug: 'blues', color: '#34495E', description: 'Soulful and emotional' },
    { name: 'Country', slug: 'country', color: '#E67E22', description: 'American folk music' },
    { name: 'Reggae', slug: 'reggae', color: '#27AE60', description: 'Jamaican rhythm and vibes' },
    { name: 'Hip-hop', slug: 'hip-hop', color: '#E74C3C', description: 'Urban beats and rap' },
    { name: 'Electronic', slug: 'electronic', color: '#8E44AD', description: 'Synthesized and digital sounds' },
    { name: 'Metal', slug: 'metal', color: '#2C3E50', description: 'Heavy and aggressive' },
    { name: 'Opera', slug: 'opera', color: '#C0392B', description: 'Classical vocal performance' },
  ];

  for (const genre of genres) {
    await prisma.genre.upsert({
      where: { slug: genre.slug },
      update: {},
      create: genre,
    });
  }

  console.log('✅ Genres created');

  // ── Tags ──────────────────────────────────────────
  const tags = [
    'chill', 'energetic', 'romantic', 'sad', 'happy', 
    'workout', 'focus', 'sleep', 'party', 'meditation'
  ];

  for (const tag of tags) {
    await prisma.tag.upsert({
      where: { slug: tag },
      update: {},
      create: { name: tag, slug: tag },
    });
  }

  console.log('✅ Tags created');

  // ── Demo User ──────────────────────────────────────
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@marssound.ai' },
    update: {},
    create: {
      email: 'demo@marssound.ai',
      username: 'mars_demo',
      name: 'Mars Demo',
      bio: 'AI Music Creator | Exploring the future of sound',
      isPublic: true,
      favoriteGenres: ['ambient', 'electronic', 'jazz'],
      favoriteMoods: ['chill', 'focus', 'energetic'],
    },
  });

  console.log('✅ Demo user created');

  // ── Demo Tracks ──────────────────────────────────────
  const ambientGenre = await prisma.genre.findUnique({ where: { slug: 'ambient' } });

  if (ambientGenre) {
    const demoTrack = await prisma.track.create({
      data: {
        title: 'Cosmic Dreams',
        artist: 'Mars AI',
        description: 'An ethereal journey through space',
        audioUrl: 'https://example.com/demo-track.mp3',
        imageUrl: 'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4',
        duration: 245,
        fileSize: 5242880,
        format: 'mp3',
        genreId: ambientGenre.id,
        moods: ['chill', 'meditation'],
        userId: demoUser.id,
        status: 'PUBLISHED',
        aiModel: 'MusicGen',
        aiPrompt: 'Create a relaxing ambient track with space vibes',
        publishedAt: new Date(),
      },
    });

    console.log('✅ Demo track created');
  }

  // ── Demo Playlist ──────────────────────────────────────
  const demoPlaylist = await prisma.playlist.create({
    data: {
      name: 'Chill Vibes',
      description: 'Perfect for relaxing and focusing',
      userId: demoUser.id,
      visibility: 'PUBLIC',
    },
  });

  console.log('✅ Demo playlist created');

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**Executar**:
```bash
npx prisma db seed
```

**Adicionar ao package.json**:
```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

---

## Supabase Storage

### Buckets

```sql
-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('audio-tracks', 'audio-tracks', true),
  ('track-covers', 'track-covers', true),
  ('user-avatars', 'user-avatars', true),
  ('playlist-covers', 'playlist-covers', true),
  ('waveforms', 'waveforms', true);

-- Storage policies for audio-tracks
CREATE POLICY "Anyone can view audio tracks"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'audio-tracks');

CREATE POLICY "Authenticated users can upload audio"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'audio-tracks' 
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "Users can update their own audio"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'audio-tracks' 
    AND owner = auth.uid()
  );

CREATE POLICY "Users can delete their own audio"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'audio-tracks' 
    AND owner = auth.uid()
  );

-- Repeat for other buckets (track-covers, user-avatars, etc.)
```

---

## Backup e Restore

### Backup Automático

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
DATABASE_URL="your-database-url"
BACKUP_DIR="./backups"

mkdir -p $BACKUP_DIR

pg_dump $DATABASE_URL > $BACKUP_DIR/backup_$DATE.sql

echo "Backup created: backup_$DATE.sql"

# Keep only last 7 days
find $BACKUP_DIR -type f -mtime +7 -delete
```

### Restore

```bash
psql $DATABASE_URL < ./backups/backup_20260326_120000.sql
```

---

## Monitoring & Analytics

### Views para Analytics

```sql
-- Most played tracks this month
CREATE VIEW top_tracks_this_month AS
SELECT 
  t.id,
  t.title,
  t.artist,
  COUNT(ph.id) AS play_count
FROM tracks t
LEFT JOIN play_history ph ON t.id = ph.track_id
WHERE ph.played_at >= DATE_TRUNC('month', NOW())
GROUP BY t.id, t.title, t.artist
ORDER BY play_count DESC
LIMIT 100;

-- Most active users this week
CREATE VIEW top_users_this_week AS
SELECT 
  u.id,
  u.username,
  u.name,
  COUNT(ph.id) AS total_plays
FROM users u
LEFT JOIN play_history ph ON u.id = ph.user_id
WHERE ph.played_at >= NOW() - INTERVAL '7 days'
GROUP BY u.id, u.username, u.name
ORDER BY total_plays DESC
LIMIT 50;

-- Genre popularity
CREATE VIEW genre_stats AS
SELECT 
  g.name,
  COUNT(DISTINCT t.id) AS track_count,
  SUM(t.play_count) AS total_plays
FROM genres g
LEFT JOIN tracks t ON g.id = t.genre_id
WHERE t.status = 'PUBLISHED'
GROUP BY g.id, g.name
ORDER BY total_plays DESC;
```

---

## Conclusão

Este schema de banco de dados fornece uma base sólida para o **Mars Sound AI**, incluindo:

- ✅ Modelagem completa de dados
- ✅ Row Level Security (RLS) para segurança
- ✅ Functions e Triggers para automação
- ✅ Indexes para performance
- ✅ Full-text search
- ✅ Analytics e reporting
- ✅ Backup e restore

### Próximos Passos

1. Deploy no Supabase
2. Configurar backups automáticos
3. Implementar rate limiting
4. Adicionar logs e monitoring
5. Criar dashboards de analytics

---

**Versão**: 1.0.0  
**Data**: 26 de Março de 2026  
**Autor**: Equipe Mars Sound AI
