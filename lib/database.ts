// Cloudflare D1 Database Utilities
// Provides type-safe database operations for SQLite with D1

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  dump(): Promise<ArrayBuffer>;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
  exec(query: string): Promise<D1ExecResult>;
}

export interface D1PreparedStatement {
  bind(...values: any[]): D1PreparedStatement;
  first<T = unknown>(colName?: string): Promise<T | null>;
  run(): Promise<D1Result>;
  all<T = unknown>(): Promise<D1Result<T>>;
  raw<T = unknown>(): Promise<T[]>;
}

export interface D1Result<T = Record<string, unknown>> {
  results?: T[];
  success: boolean;
  error?: string;
  meta: {
    changed_db: boolean;
    changes: number;
    duration: number;
    last_row_id: number;
    rows_read: number;
    rows_written: number;
    size_after: number;
  };
}

export interface D1ExecResult {
  count: number;
  duration: number;
}

// Database Models
export interface User {
  id: number;
  callsign: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  is_verified: number;
  created_at: string;
  updated_at: string;
}

export interface Photo {
  id: number;
  user_id: number;
  title: string;
  description?: string;
  filename: string;
  original_name: string;
  mime_type: string;
  file_size: number;
  url: string;
  thumbnail_url?: string;
  is_public: number;
  upload_date: string;
  metadata?: string;
}

export interface PhotoTag {
  id: number;
  photo_id: number;
  tag: string;
}

export interface IframeConfig {
  id: number;
  user_id: number;
  name: string;
  photo_ids: string; // JSON array
  settings: string;   // JSON object
  is_public: number;
  created_at: string;
  updated_at: string;
}

// Database Connection and Utilities
class D1DatabaseService {
  private db: D1Database;

  constructor(database: D1Database) {
    this.db = database;
  }

  // User Operations
  async createUser(userData: {
    callsign: string;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
  }): Promise<User | null> {
    try {
      const result = await this.db
        .prepare(`
          INSERT INTO users (callsign, email, password, first_name, last_name)
          VALUES (?, ?, ?, ?, ?)
        `)
        .bind(userData.callsign, userData.email, userData.password, userData.first_name, userData.last_name)
        .run();

      if (result.success) {
        return await this.getUserById(result.meta.last_row_id);
      }
      return null;
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  }

  async getUserById(id: number): Promise<User | null> {
    try {
      const user = await this.db
        .prepare('SELECT * FROM users WHERE id = ?')
        .bind(id)
        .first<User>();
      return user;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }
  }

  async getUserByCallsign(callsign: string): Promise<User | null> {
    try {
      const user = await this.db
        .prepare('SELECT * FROM users WHERE callsign = ? COLLATE NOCASE')
        .bind(callsign)
        .first<User>();
      return user;
    } catch (error) {
      console.error('Error getting user by callsign:', error);
      return null;
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const user = await this.db
        .prepare('SELECT * FROM users WHERE email = ? COLLATE NOCASE')
        .bind(email)
        .first<User>();
      return user;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  }

  async updateUser(id: number, updates: Partial<User>): Promise<boolean> {
    try {
      const setClause = Object.keys(updates)
        .filter(key => key !== 'id')
        .map(key => `${key} = ?`)
        .join(', ');
      
      const values = Object.entries(updates)
        .filter(([key]) => key !== 'id')
        .map(([, value]) => value);

      const result = await this.db
        .prepare(`UPDATE users SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
        .bind(...values, id)
        .run();

      return result.success;
    } catch (error) {
      console.error('Error updating user:', error);
      return false;
    }
  }

  // Photo Operations
  async createPhoto(photoData: {
    user_id: number;
    title: string;
    description?: string;
    filename: string;
    original_name: string;
    mime_type: string;
    file_size: number;
    url: string;
    thumbnail_url?: string;
    is_public?: number;
    metadata?: string;
  }): Promise<Photo | null> {
    try {
      const result = await this.db
        .prepare(`
          INSERT INTO photos (user_id, title, description, filename, original_name, 
                            mime_type, file_size, url, thumbnail_url, is_public, metadata)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
        .bind(
          photoData.user_id,
          photoData.title,
          photoData.description || null,
          photoData.filename,
          photoData.original_name,
          photoData.mime_type,
          photoData.file_size,
          photoData.url,
          photoData.thumbnail_url || null,
          photoData.is_public || 1,
          photoData.metadata || null
        )
        .run();

      if (result.success) {
        return await this.getPhotoById(result.meta.last_row_id);
      }
      return null;
    } catch (error) {
      console.error('Error creating photo:', error);
      return null;
    }
  }

  async getPhotoById(id: number): Promise<Photo | null> {
    try {
      const photo = await this.db
        .prepare('SELECT * FROM photos WHERE id = ?')
        .bind(id)
        .first<Photo>();
      return photo;
    } catch (error) {
      console.error('Error getting photo by ID:', error);
      return null;
    }
  }

  async getPublicPhotos(limit: number = 50, offset: number = 0): Promise<Photo[]> {
    try {
      const result = await this.db
        .prepare('SELECT * FROM photos WHERE is_public = 1 ORDER BY upload_date DESC LIMIT ? OFFSET ?')
        .bind(limit, offset)
        .all<Photo>();
      return result.results || [];
    } catch (error) {
      console.error('Error getting public photos:', error);
      return [];
    }
  }

  async getUserPhotos(userId: number, includePrivate: boolean = false): Promise<Photo[]> {
    try {
      const query = includePrivate 
        ? 'SELECT * FROM photos WHERE user_id = ? ORDER BY upload_date DESC'
        : 'SELECT * FROM photos WHERE user_id = ? AND is_public = 1 ORDER BY upload_date DESC';
      
      const result = await this.db
        .prepare(query)
        .bind(userId)
        .all<Photo>();
      return result.results || [];
    } catch (error) {
      console.error('Error getting user photos:', error);
      return [];
    }
  }

  async deletePhoto(id: number, userId: number): Promise<boolean> {
    try {
      const result = await this.db
        .prepare('DELETE FROM photos WHERE id = ? AND user_id = ?')
        .bind(id, userId)
        .run();
      return result.success && result.meta.changes > 0;
    } catch (error) {
      console.error('Error deleting photo:', error);
      return false;
    }
  }

  // Photo Tags Operations
  async addPhotoTag(photoId: number, tag: string): Promise<boolean> {
    try {
      const result = await this.db
        .prepare('INSERT OR IGNORE INTO photo_tags (photo_id, tag) VALUES (?, ?)')
        .bind(photoId, tag.toLowerCase())
        .run();
      return result.success;
    } catch (error) {
      console.error('Error adding photo tag:', error);
      return false;
    }
  }

  async getPhotoTags(photoId: number): Promise<string[]> {
    try {
      const result = await this.db
        .prepare('SELECT tag FROM photo_tags WHERE photo_id = ?')
        .bind(photoId)
        .all<{ tag: string }>();
      return (result.results || []).map(row => row.tag);
    } catch (error) {
      console.error('Error getting photo tags:', error);
      return [];
    }
  }

  async removePhotoTag(photoId: number, tag: string): Promise<boolean> {
    try {
      const result = await this.db
        .prepare('DELETE FROM photo_tags WHERE photo_id = ? AND tag = ?')
        .bind(photoId, tag.toLowerCase())
        .run();
      return result.success;
    } catch (error) {
      console.error('Error removing photo tag:', error);
      return false;
    }
  }

  // Iframe Config Operations
  async createIframeConfig(configData: {
    user_id: number;
    name: string;
    photo_ids: number[];
    settings: object;
    is_public?: number;
  }): Promise<IframeConfig | null> {
    try {
      const result = await this.db
        .prepare(`
          INSERT INTO iframe_configs (user_id, name, photo_ids, settings, is_public)
          VALUES (?, ?, ?, ?, ?)
        `)
        .bind(
          configData.user_id,
          configData.name,
          JSON.stringify(configData.photo_ids),
          JSON.stringify(configData.settings),
          configData.is_public || 0
        )
        .run();

      if (result.success) {
        return await this.getIframeConfigById(result.meta.last_row_id);
      }
      return null;
    } catch (error) {
      console.error('Error creating iframe config:', error);
      return null;
    }
  }

  async getIframeConfigById(id: number): Promise<IframeConfig | null> {
    try {
      const config = await this.db
        .prepare('SELECT * FROM iframe_configs WHERE id = ?')
        .bind(id)
        .first<IframeConfig>();
      return config;
    } catch (error) {
      console.error('Error getting iframe config by ID:', error);
      return null;
    }
  }

  async getUserIframeConfigs(userId: number): Promise<IframeConfig[]> {
    try {
      const result = await this.db
        .prepare('SELECT * FROM iframe_configs WHERE user_id = ? ORDER BY created_at DESC')
        .bind(userId)
        .all<IframeConfig>();
      return result.results || [];
    } catch (error) {
      console.error('Error getting user iframe configs:', error);
      return [];
    }
  }

  // Health Check
  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.db
        .prepare('SELECT 1 as test')
        .first<{ test: number }>();
      return result?.test === 1;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }
}

// Helper function to initialize database service
export function createDatabaseService(database: D1Database): D1DatabaseService {
  return new D1DatabaseService(database);
}

// Export the service class
export { D1DatabaseService };

// Default export for convenience
export default D1DatabaseService;
