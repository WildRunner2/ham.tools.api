-- SP3FCK Ham Tools Database Schema for Cloudflare D1

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    callsign TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    is_verified INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Photos table
CREATE TABLE IF NOT EXISTS photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    is_public INTEGER DEFAULT 1,
    upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    metadata TEXT, -- JSON string for additional metadata
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Photo tags table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS photo_tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    photo_id INTEGER NOT NULL,
    tag TEXT NOT NULL,
    FOREIGN KEY (photo_id) REFERENCES photos (id) ON DELETE CASCADE,
    UNIQUE(photo_id, tag)
);

-- Iframe configurations table
CREATE TABLE IF NOT EXISTS iframe_configs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    photo_ids TEXT NOT NULL, -- JSON array of photo IDs
    settings TEXT NOT NULL,  -- JSON object with iframe settings
    is_public INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_callsign ON users(callsign);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_photos_user_id ON photos(user_id);
CREATE INDEX IF NOT EXISTS idx_photos_is_public ON photos(is_public);
CREATE INDEX IF NOT EXISTS idx_photos_upload_date ON photos(upload_date DESC);
CREATE INDEX IF NOT EXISTS idx_photo_tags_photo_id ON photo_tags(photo_id);
CREATE INDEX IF NOT EXISTS idx_photo_tags_tag ON photo_tags(tag);
CREATE INDEX IF NOT EXISTS idx_iframe_configs_user_id ON iframe_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_iframe_configs_is_public ON iframe_configs(is_public);

-- Insert some sample data for development
INSERT OR IGNORE INTO users (callsign, email, password, first_name, last_name, is_verified) VALUES 
('SP3FCK', 'sp3fck@example.com', '$2a$12$dummy.hash.for.development.only', 'John', 'Ham', 1);

-- Get the user ID for sample photos
INSERT OR IGNORE INTO photos (user_id, title, description, filename, original_name, mime_type, file_size, url, is_public) VALUES 
(1, 'My Ham Radio Station', 'Main operating position with Yaesu FT-991A', 'station-001.jpg', 'station.jpg', 'image/jpeg', 1024000, 'https://via.placeholder.com/800x600/333/fff?text=Ham+Station', 1),
(1, 'Antenna Farm', 'Yagi antennas for VHF/UHF operations', 'antenna-001.jpg', 'antennas.jpg', 'image/jpeg', 2048000, 'https://via.placeholder.com/800x600/333/fff?text=Antenna+Farm', 1),
(1, 'QSL Card Collection', 'Some of my favorite QSL cards from around the world', 'qsl-001.jpg', 'qsl-cards.jpg', 'image/jpeg', 1536000, 'https://via.placeholder.com/800x600/333/fff?text=QSL+Cards', 1),
(1, 'Field Day 2024', 'Operating portable during ARRL Field Day contest', 'fieldday-001.jpg', 'field-day.jpg', 'image/jpeg', 1792000, 'https://via.placeholder.com/800x600/333/fff?text=Field+Day', 1),
(1, 'Tower Maintenance', 'Installing new rotator for HF beam antenna', 'tower-001.jpg', 'tower-work.jpg', 'image/jpeg', 2304000, 'https://via.placeholder.com/800x600/333/fff?text=Tower+Work', 1),
(1, 'Contest Setup', 'Ready for CQ WW DX Contest weekend', 'contest-001.jpg', 'contest-station.jpg', 'image/jpeg', 1920000, 'https://via.placeholder.com/800x600/333/fff?text=Contest+Setup', 1);

-- Add some tags for the sample photos
INSERT OR IGNORE INTO photo_tags (photo_id, tag) VALUES 
(1, 'station'), (1, 'equipment'), (1, 'yaesu'),
(2, 'antenna'), (2, 'vhf'), (2, 'uhf'), (2, 'yagi'),
(3, 'qsl'), (3, 'collection'), (3, 'dx'),
(4, 'fieldday'), (4, 'portable'), (4, 'contest'),
(5, 'tower'), (5, 'maintenance'), (5, 'antenna'),
(6, 'contest'), (6, 'dx'), (6, 'cq-ww');
