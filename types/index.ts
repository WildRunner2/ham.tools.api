export interface User {
  id?: number;
  callsign: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  is_verified: number; // SQLite uses integers for booleans
  created_at: string;
  updated_at: string;
}

export interface Photo {
  id?: number;
  user_id: number;
  title: string;
  description?: string;
  filename: string;
  original_name: string;
  mime_type: string;
  file_size: number;
  url: string;
  thumbnail_url?: string;
  is_public: number; // SQLite uses integers for booleans
  upload_date: string;
  metadata?: string; // JSON string in SQLite
}

export interface PhotoTag {
  id?: number;
  photo_id: number;
  tag: string;
}

export interface IframeConfig {
  id?: number;
  user_id: number;
  name: string;
  photo_ids: string; // JSON array stored as string in SQLite
  settings: string;   // JSON object stored as string in SQLite
  is_public: number;  // SQLite uses integers for booleans
  created_at: string;
  updated_at: string;
}

// Frontend-friendly interfaces (for API responses)
export interface UserResponse {
  id: number;
  callsign: string;
  email: string;
  firstName: string;
  lastName: string;
  isVerified: boolean;
  createdAt: string;
}

export interface PhotoResponse {
  id: number;
  userId: number;
  title: string;
  description?: string;
  filename: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  url: string;
  thumbnailUrl?: string;
  tags: string[];
  isPublic: boolean;
  uploadDate: string;
  metadata?: {
    width?: number;
    height?: number;
    camera?: string;
    location?: string;
  };
}

export interface IframeSettings {
  width: number;
  height: number;
  autoPlay: boolean;
  interval: number;
  showTitles: boolean;
  showControls: boolean;
  borderRadius: number;
  backgroundColor: string;
}

export interface IframeConfigResponse {
  id: number;
  userId: number;
  name: string;
  photoIds: number[];
  settings: IframeSettings;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface AuthTokenPayload {
  userId: string;
  callsign: string;
  email: string;
}

export interface LoginRequest {
  callsign: string;
  password: string;
}

export interface RegisterRequest {
  callsign: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface PhotoUploadRequest {
  title: string;
  description?: string;
  tags: string[];
  isPublic: boolean;
}
