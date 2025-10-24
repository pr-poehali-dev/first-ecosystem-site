-- Расширяем таблицу users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS workplace VARCHAR(200),
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS fmonet_balance INTEGER DEFAULT 100;

-- Таблица друзей
CREATE TABLE IF NOT EXISTS friendships (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  friend_id INTEGER NOT NULL REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, friend_id)
);

CREATE INDEX IF NOT EXISTS idx_friendships_user ON friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend ON friendships(friend_id);

-- Таблица личных сообщений
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  sender_id INTEGER NOT NULL REFERENCES users(id),
  receiver_id INTEGER NOT NULL REFERENCES users(id),
  message_type VARCHAR(20) DEFAULT 'text',
  content TEXT,
  media_url TEXT,
  sticker_id INTEGER,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);

-- Таблица стикер-паков
CREATE TABLE IF NOT EXISTS sticker_packs (
  id SERIAL PRIMARY KEY,
  creator_id INTEGER NOT NULL REFERENCES users(id),
  title VARCHAR(100) NOT NULL,
  description TEXT,
  preview_url TEXT,
  price INTEGER DEFAULT 50,
  downloads_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sticker_packs_creator ON sticker_packs(creator_id);

-- Таблица стикеров
CREATE TABLE IF NOT EXISTS stickers (
  id SERIAL PRIMARY KEY,
  pack_id INTEGER NOT NULL REFERENCES sticker_packs(id),
  image_url TEXT NOT NULL,
  emoji_tag VARCHAR(50)
);

CREATE INDEX IF NOT EXISTS idx_stickers_pack ON stickers(pack_id);

-- Таблица покупок стикеров
CREATE TABLE IF NOT EXISTS sticker_purchases (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  pack_id INTEGER NOT NULL REFERENCES sticker_packs(id),
  purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, pack_id)
);

CREATE INDEX IF NOT EXISTS idx_purchases_user ON sticker_purchases(user_id);

-- Таблица курсов FIRST-21
CREATE TABLE IF NOT EXISTS courses (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  cover_url TEXT,
  status VARCHAR(20) DEFAULT 'coming_soon',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Добавляем начальные курсы
INSERT INTO courses (title, category, description, status) VALUES
('Основы фотографии', 'photography', 'Научитесь создавать профессиональные фотографии с нуля', 'coming_soon'),
('Видеомонтаж для начинающих', 'video', 'Освойте видеомонтаж и создавайте крутые ролики', 'coming_soon'),
('Графический дизайн', 'design', 'Создавайте потрясающие дизайны для соцсетей и брендов', 'coming_soon');