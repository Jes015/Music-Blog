CREATE TABLE IF NOT EXISTS post_likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id TEXT NOT NULL,
    ip_hash TEXT NOT NULL,
    country TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    UNIQUE(post_id, ip_hash)
);

CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_ip_created ON post_likes(ip_hash, created_at);
