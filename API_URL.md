# API Configuration

## Deployed API URL
Your API is now live at: **https://sp3fck-ham-tools-api.hamtools.workers.dev**

## Frontend Configuration
To connect your React frontend to this API, update your frontend configuration:

### 1. Update API Base URL
In your frontend project (`ham.tools`), update the API configuration file:

**File: `src/config/api.ts` or equivalent**
```typescript
export const API_BASE_URL = 'https://sp3fck-ham-tools-api.hamtools.workers.dev/api';
```

### 2. Update Environment Variables
If using environment variables, update your `.env` file:

```env
VITE_API_URL=https://sp3fck-ham-tools-api.hamtools.workers.dev/api
```

## API Endpoints Available

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Photos
- `GET /api/photos` - Get photos (with pagination)
- Query parameters:
  - `page` - Page number (default: 1)
  - `limit` - Items per page (default: 20)
  - `userId` - Filter by user ID
  - `isPublic` - Filter public photos (default: true)

### Iframe Viewer
- `GET /api/iframe/viewer` - Generate photo gallery iframe
- Query parameters:
  - `photos` - Comma-separated photo IDs
  - `width` - Gallery width (default: 600)
  - `height` - Gallery height (default: 400)
  - `autoplay` - Auto-play slideshow (default: true)
  - `interval` - Slide interval in ms (default: 5000)
  - `titles` - Show photo titles (default: true)
  - `controls` - Show navigation controls (default: true)

## Database Status
- ✅ API deployed successfully
- ⚠️ Database schema needs to be initialized manually in Cloudflare dashboard
- ⚠️ You may need to create a new API token with D1 Database permissions

## Next Steps
1. Update frontend API configuration
2. Test authentication endpoints
3. Set up database permissions in Cloudflare dashboard
4. Add sample photos for testing

## Example Frontend API Call
```typescript
// Example fetch to get photos
const response = await fetch('https://sp3fck-ham-tools-api.hamtools.workers.dev/api/photos');
const data = await response.json();
console.log(data);
```
