import { createDatabaseService } from '../../lib/database.js';
import { ApiResponse } from '../../types/index.js';

export default {
  async fetch(request: Request, env: any): Promise<Response> {
    // Handle CORS
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'GET') {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Method not allowed' 
      } as ApiResponse), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    try {
      const url = new URL(request.url);
      const db = createDatabaseService(env.DB);

      // Parse query parameters
      const page = parseInt(url.searchParams.get('page') || '1', 10);
      const limit = parseInt(url.searchParams.get('limit') || '20', 10);
      const userId = url.searchParams.get('userId');
      const isPublic = url.searchParams.get('isPublic') !== 'false';

      const offset = (page - 1) * limit;

      let photos;
      if (userId && !isPublic) {
        // Get user's photos (including private ones if user is authenticated)
        photos = await db.getUserPhotos(parseInt(userId, 10), true);
      } else if (userId) {
        // Get user's public photos only
        photos = await db.getUserPhotos(parseInt(userId, 10), false);
      } else {
        // Get all public photos
        photos = await db.getPublicPhotos(limit, offset);
      }

      // For tags filtering, we would need to implement a separate method in the database service
      // For now, we'll return the basic photo list

      // Calculate pagination info (simplified for now)
      const totalCount = photos.length;
      const totalPages = Math.ceil(totalCount / limit);

      // Apply pagination if we have all photos
      const paginatedPhotos = photos.slice(offset, offset + limit);

      // Get tags for each photo (optional enhancement)
      const photosWithTags = await Promise.all(
        paginatedPhotos.map(async (photo) => {
          const tags = await db.getPhotoTags(photo.id);
          return {
            ...photo,
            tags,
            isPublic: photo.is_public === 1,
            uploadDate: photo.upload_date,
            thumbnailUrl: photo.thumbnail_url,
            fileSize: photo.file_size,
            mimeType: photo.mime_type,
            originalName: photo.original_name
          };
        })
      );

      return new Response(JSON.stringify({
        success: true,
        data: {
          photos: photosWithTags,
          pagination: {
            currentPage: page,
            totalPages,
            totalCount,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
          }
        }
      } as ApiResponse), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('Get photos error:', error);
      return new Response(JSON.stringify({
        success: false,
        message: 'Internal server error'
      } as ApiResponse), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};
