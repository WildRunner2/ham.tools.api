# SP3FCK Ham Tools API

Backend API for SP3FCK Ham Tools - A Node.js TypeScript API built for Cloudflare Workers with D1 SQLite database integration.

## 🌟 Features

- 🔐 **JWT Authentication** - Secure user registration and login
- 👤 **Ham Radio Callsign Validation** - Proper amateur radio callsign format verification  
- 📸 **Photo Management** - Upload, organize, and display ham radio photos
- 🖼️ **Iframe Gallery Generator** - Create embeddable photo galleries for QRZ.com
- 🗄️ **Cloudflare D1** - Fast SQLite database with global edge distribution
- ⚡ **Serverless Architecture** - Built for Cloudflare Workers platform
- 🛡️ **Input Validation** - Comprehensive request validation using Joi schemas
- 🌐 **CORS Enabled** - Ready for cross-origin requests from frontend
- 📱 **Responsive Iframe Galleries** - Mobile-friendly embedded galleries

## 🏗️ Tech Stack

- **Runtime**: Cloudflare Workers
- **Language**: TypeScript
- **Database**: Cloudflare D1 (SQLite)
- **Authentication**: JWT (jsonwebtoken + bcryptjs)
- **Validation**: Joi schemas
- **Image Storage**: Cloudinary integration
- **Development**: Wrangler CLI

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration with callsign validation
- `POST /api/auth/login` - User login with JWT token generation

### Photos
- `GET /api/photos` - Get public photos (supports pagination, filtering)
- `POST /api/photos/upload` - Upload new photo (authenticated)
- `GET /api/photos/:id` - Get specific photo details
- `DELETE /api/photos/:id` - Delete photo (authenticated, owner only)

### Iframe Integration
- `GET /api/iframe/viewer` - Generate iframe HTML for QRZ.com integration

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- Cloudflare account with Workers and D1 enabled
- Wrangler CLI installed globally: `npm install -g wrangler`

### Installation

1. **Clone and setup**:
```bash
git clone <repository-url>
cd ham.tools.api
npm install
```

2. **Configure Cloudflare**:
```bash
# Login to Cloudflare
wrangler login

# Create D1 database
wrangler d1 create ham-tools-db
```

3. **Environment Setup**:
```bash
# Copy environment file
cp .env.example .env

# Update .env with your values:
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
NODE_ENV=development
CLOUDFLARE_ACCOUNT_ID=your-cloudflare-account-id
CLOUDFLARE_DATABASE_ID=your-d1-database-id
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
ALLOWED_ORIGINS=http://localhost:3000,https://your-frontend-domain.com
```

4. **Database Setup**:
```bash
# Initialize database schema
npm run db:init

# Apply migrations (if any)
npm run db:migrate
```

5. **Development**:
```bash
# Start development server
npm run dev

# Your API will be available at:
# http://localhost:8787
```

## 📁 Project Structure

```
ham.tools.api/
│
├── api/                  # API endpoints
│   ├── auth/            # Authentication routes
│   │   ├── register.ts  # User registration
│   │   └── login.ts     # User login
│   ├── photos/          # Photo management
│   │   └── index.ts     # Photo CRUD operations
│   └── iframe/          # Iframe generation
│       └── viewer.ts    # Gallery iframe generator
│
├── lib/                 # Utility libraries
│   ├── database.ts      # Cloudflare D1 database service
│   ├── auth.ts          # Authentication utilities
│   └── validation.ts    # Joi validation schemas
│
├── types/               # TypeScript type definitions
│   └── index.ts         # Shared types and interfaces
│
├── schema.sql           # Database schema for D1
├── wrangler.toml        # Cloudflare Workers configuration
├── package.json         # Dependencies and scripts
└── tsconfig.json        # TypeScript configuration
```

## 🗄️ Database Schema

The API uses Cloudflare D1 SQLite database with the following tables:

- **users** - User accounts with callsign and authentication data
- **photos** - Photo metadata and storage information
- **photo_tags** - Many-to-many relationship for photo tagging
- **iframe_configs** - Saved iframe configuration templates

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start development server with hot reload
npm run build            # Build TypeScript to JavaScript
npm run type-check       # Check TypeScript without emitting

# Database
npm run db:init          # Initialize database with schema
npm run db:migrate       # Apply database migrations

# Deployment
npm run deploy           # Deploy to Cloudflare Workers

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues automatically
npm test                 # Run tests (if configured)
```

## 🌐 Deployment

### Cloudflare Workers Deployment

1. **Configure wrangler.toml**:
   - Update account_id with your Cloudflare account ID
   - Ensure database binding matches your D1 database

2. **Set environment variables**:
```bash
# Set production environment variables
wrangler secret put JWT_SECRET
wrangler secret put CLOUDINARY_API_SECRET
# ... other secrets
```

3. **Deploy**:
```bash
npm run deploy
```

Your API will be available at: `https://ham-tools-api.<your-subdomain>.workers.dev`

### Environment Variables

Set these in Cloudflare Workers dashboard or via Wrangler:

- `JWT_SECRET` - Secret key for JWT token signing
- `JWT_EXPIRES_IN` - Token expiration time (default: 7d)
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret
- `ALLOWED_ORIGINS` - Comma-separated list of allowed CORS origins

## 🧪 Testing

### Manual Testing

Use the provided test endpoints:

```bash
# Test registration
curl -X POST https://your-api-url/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"callsign":"SP3FCK","email":"test@example.com","password":"password123","firstName":"John","lastName":"Ham"}'

# Test login
curl -X POST https://your-api-url/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"callsign":"SP3FCK","password":"password123"}'

# Test photos endpoint
curl https://your-api-url/api/photos

# Test iframe generator
curl "https://your-api-url/api/iframe/viewer?photos=1,2,3&width=800&height=600"
```

## 🛡️ Security Features

- 🔐 **JWT Authentication** - Stateless token-based authentication
- 🔒 **Password Hashing** - bcrypt with salt rounds for secure password storage
- ✅ **Input Validation** - Joi schemas validate all incoming requests
- 🛡️ **SQL Injection Protection** - Prepared statements with parameter binding
- 🌐 **CORS Configuration** - Configurable origins for cross-origin requests
- 🔍 **Callsign Validation** - Amateur radio callsign format verification

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support, email sp3fck@example.com or create an issue in the repository.

---

**73!** 📻 *Happy ham radio operating!*

*SP3FCK Ham Tools - Connecting hams worldwide through technology*
