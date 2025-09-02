import { createDatabaseService } from '../../lib/database.js';
import { ApiResponse } from '../../types/index.js';

export default {
  async fetch(request: Request, env: any): Promise<Response> {
    // Handle CORS
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
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

      const photoIds = url.searchParams.get('photos');
      const width = url.searchParams.get('width') || '600';
      const height = url.searchParams.get('height') || '400';
      const autoplay = url.searchParams.get('autoplay') !== 'false';
      const interval = url.searchParams.get('interval') || '5000';
      const titles = url.searchParams.get('titles') !== 'false';
      const controls = url.searchParams.get('controls') !== 'false';

      if (!photoIds) {
        return new Response(JSON.stringify({
          success: false,
          message: 'Photo IDs are required'
        } as ApiResponse), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Parse photo IDs
      const photoIdArray = photoIds.split(',').map(id => parseInt(id.trim(), 10));

      // Get photos from database
      const photos = await Promise.all(
        photoIdArray.map(async (id) => {
          const photo = await db.getPhotoById(id);
          // Only return public photos
          return photo && photo.is_public === 1 ? photo : null;
        })
      );

      // Filter out null values (private or non-existent photos)
      const validPhotos = photos.filter(photo => photo !== null);

      // Generate HTML for iframe
      const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SP3FCK Ham Radio Gallery</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            background: #121212;
            color: #ffffff;
            overflow: hidden;
        }
        
        .gallery-container {
            width: ${width}px;
            height: ${height}px;
            position: relative;
            background: #1e1e1e;
            border-radius: 8px;
            overflow: hidden;
        }
        
        .photo-slide {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            opacity: 0;
            transition: opacity 0.5s ease-in-out;
        }
        
        .photo-slide.active {
            opacity: 1;
        }
        
        .photo-slide img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .photo-info {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: linear-gradient(transparent, rgba(0,0,0,0.8));
            padding: 20px 15px 10px;
            ${!titles ? 'display: none;' : ''}
        }
        
        .photo-title {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 5px;
            color: #ff6b35;
        }
        
        .photo-description {
            font-size: 12px;
            color: #b3b3b3;
        }
        
        .controls {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            background: rgba(0,0,0,0.5);
            color: white;
            border: none;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 18px;
            ${!controls ? 'display: none;' : ''}
        }
        
        .controls:hover {
            background: rgba(255,107,53,0.8);
        }
        
        .prev {
            left: 10px;
        }
        
        .next {
            right: 10px;
        }
        
        .indicators {
            position: absolute;
            bottom: 10px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 8px;
            ${!controls ? 'display: none;' : ''}
        }
        
        .indicator {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: rgba(255,255,255,0.4);
            cursor: pointer;
            transition: background 0.3s;
        }
        
        .indicator.active {
            background: #ff6b35;
        }
        
        .sp3fck-badge {
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(255,107,53,0.9);
            color: white;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: bold;
            font-family: 'Courier New', monospace;
        }
    </style>
</head>
<body>
    <div class="gallery-container">
        <div class="sp3fck-badge">SP3FCK</div>
        ${validPhotos.map((photo, index) => `
            <div class="photo-slide ${index === 0 ? 'active' : ''}" data-index="${index}">
                <img src="${photo.url}" alt="${photo.title}">
                <div class="photo-info">
                    <div class="photo-title">${photo.title}</div>
                    <div class="photo-description">${photo.description || ''}</div>
                </div>
            </div>
        `).join('')}
        
        ${controls ? `
            <button class="controls prev" onclick="changeSlide(-1)">‹</button>
            <button class="controls next" onclick="changeSlide(1)">›</button>
            
            <div class="indicators">
                ${validPhotos.map((_, index) => `
                    <div class="indicator ${index === 0 ? 'active' : ''}" onclick="goToSlide(${index})"></div>
                `).join('')}
            </div>
        ` : ''}
    </div>
    
    <script>
        let currentSlide = 0;
        const slides = document.querySelectorAll('.photo-slide');
        const indicators = document.querySelectorAll('.indicator');
        const totalSlides = slides.length;
        
        function showSlide(index) {
            slides.forEach(slide => slide.classList.remove('active'));
            indicators.forEach(indicator => indicator.classList.remove('active'));
            
            slides[index].classList.add('active');
            if (indicators[index]) indicators[index].classList.add('active');
            currentSlide = index;
        }
        
        function changeSlide(direction) {
            const newIndex = (currentSlide + direction + totalSlides) % totalSlides;
            showSlide(newIndex);
        }
        
        function goToSlide(index) {
            showSlide(index);
        }
        
        // Auto-play functionality
        ${autoplay ? `
            setInterval(() => {
                changeSlide(1);
            }, ${interval});
        ` : ''}
    </script>
</body>
</html>`;

      // Return HTML response
      return new Response(html, {
        headers: {
          'Content-Type': 'text/html',
          ...corsHeaders
        }
      });

    } catch (error) {
      console.error('Iframe viewer error:', error);
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
