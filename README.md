# LinkForge

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-ISC-green)
![Node.js](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)
![Express](https://img.shields.io/badge/express-5.2.1-black)
![Prisma ORM](https://img.shields.io/badge/prisma-6.19.3-2D3748?logo=prisma)
![PostgreSQL](https://img.shields.io/badge/postgresql-supported-336791?logo=postgresql)
![MongoDB](https://img.shields.io/badge/mongodb-9.6.2-13AA52?logo=mongodb)
![Redis](https://img.shields.io/badge/redis-5.12.1-DC382D?logo=redis)
![IPINFO](https://img.shields.io/badge/ipinfo-geolocation-FF6B6B)
![Status](https://img.shields.io/badge/status-active-success)

A powerful, enterprise-grade URL management platform with advanced analytics, intelligent tracking, and workspace management. Create, manage, and analyze short URLs with comprehensive insights into user behavior, geographic distribution, device types, and referrer patterns.


## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client / Browser                          │
│                   (Frontend Application)                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │  Google OAuth   │◄─── Authentication
                    └────────────────┘
                             │
                    ┌────────▼──────────────────┐
                    │   Express.js Server      │
                    │  (Port 3000)             │
                    │                          │
                    │  ┌──────────────────┐   │
                    │  │ Routes & Handlers│   │
                    │  │  • Auth Routes   │   │
                    │  │  • Link Routes   │   │
                    │  │  • URL Routes    │   │
                    │  │  • Analytics     │   │
                    │  └──────────────────┘   │
                    │         │               │
                    │  ┌──────▼──────────┐   │
                    │  │  Controllers    │   │
                    │  │  & Middlewares  │   │
                    │  └──────────────────┘   │
                    └──┬──────┬────────┬──────┘
                       │      │        │
        ┌──────────────┘      │        └──────────────┐
        │                     │                       │
┌───────▼──────┐    ┌────────▼────────┐    ┌────────▼────────┐
│ PostgreSQL   │    │    MongoDB      │    │     Redis       │
│  (Prisma)    │    │   (Analytics)   │    │   (Sessions)    │
│              │    │                 │    │                 │
│ • Users      │    │ • LinkStats     │    │ • Session       │
│ • Workspaces │    │ • ClickEvents   │    │   Store         │
│ • ShortURLs  │    │ • Metrics       │    │                 │
│ • API Keys   │    │                 │    │                 │
└──────────────┘    └─────────────────┘    └─────────────────┘
        │
        │ URL Redirect
        │
┌───────▼──────────────┐
│  Redirect Response   │
│  (Original URL)      │
└──────────────────────┘

External Services:
├── Google OAuth 2.0 (Authentication)
├── IPinfo API (Geographic Data)
└── User-Agent Detection (Device Type)
```

## Features

- **URL Shortening**: Create short, custom, or auto-generated slugs for any URL
- **Custom Slugs**: Define your own short URL slugs (if not taken)
- **URL Expiration**: Set expiration dates for short URLs with automatic deactivation
- **Advanced Analytics**: Track clicks with detailed metrics including:
  - Total click count
  - Daily click trends
  - Geographic distribution (country-based)
  - Device types (mobile, desktop, tablet)
  - Referrer sources
  - Real-time analytics
- **Google OAuth Authentication**: Secure login with Google accounts
- **Workspace Management**: Organize URLs within isolated workspaces
- **API Keys**: Generate and manage API keys for programmatic access
- **Session Management**: Redis-powered session storage for scalability
- **CORS Support**: Cross-origin request handling for frontend applications

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB instance (for click event tracking)
- PostgreSQL database (for user and URL storage)
- Redis instance (for session management)
- Google OAuth 2.0 credentials

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Url
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env-example .env
   ```

   Update `.env` with your configuration:
   ```env
   PORT=3000
   MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/database
   DATABASE_URL=postgresql://user:password@localhost:5432/urlshortener
   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_PASSWORD=your_redis_password
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
   SESSION_SECRET=your_session_secret
   IPINFO_TOKEN=your_ipinfo_token
   ```

4. **Set up the database**
   ```bash
   npx prisma migrate dev
   ```

5. **Start the server**
   ```bash
   # Development with hot reload
   npm run dev

   # Production
   npm start
   ```

   The server will be available at `http://localhost:3000`

## API Usage

### Authentication

Users must authenticate via Google OAuth to access protected endpoints.

```bash
# Login with Google
GET http://localhost:3000/auth/google

# View authenticated user profile
GET http://localhost:3000/auth/profile

# Logout
GET http://localhost:3000/auth/logout
```

### URL Shortening

All endpoints require authentication (except redirect and analytics retrieval).

#### Create a Short URL
```bash
POST /api/shorten
Content-Type: application/json

{
  "original_url": "https://example.com/very/long/url",
  "slug": "custom-slug",        # Optional - auto-generated if omitted
  "expires_at": "2026-12-31"    # Optional - ISO 8601 format
}
```

**Response:**
```json
{
  "message": "Short URL created",
  "data": {
    "id": "uuid",
    "workspace_id": "uuid",
    "slug": "custom-slug",
    "original_url": "https://example.com/very/long/url",
    "is_active": true,
    "expires_at": "2026-12-31T00:00:00Z",
    "created_at": "2026-05-15T10:30:00Z"
  }
}
```

#### Retrieve All Links
```bash
GET /api/links
Authorization: Bearer <session_token>
```

#### Update a Link
```bash
PATCH /api/links/{id}
Content-Type: application/json

{
  "slug": "new-slug",
  "expires_at": "2026-12-31"
}
```

#### Delete a Link
```bash
DELETE /api/links/{id}
```

### Analytics

#### Get Analytics by Slug
```bash
GET /analytics/{slug}
```

**Response:**
```json
{
  "analytics": {
    "slug": "ggg",
    "total_clicks": 7,
    "daily_clicks": [
      {
        "date": "2026-05-13",
        "count": 7
      }
    ],
    "top_countries": [
      {
        "country": "PK",
        "count": 5
      },
      {
        "country": "US",
        "count": 2
      }
    ],
    "top_devices": [
      {
        "device": "desktop",
        "count": 5
      },
      {
        "device": "mobile",
        "count": 2
      }
    ],
    "top_referrers": [
      {
        "source": "direct",
        "count": 4
      }
    ]
  }
}
```

#### Get Analytics for a Specific Date
```bash
GET /analytics/{slug}/{timestamp}
```

### Redirect to Original URL

```bash
GET /{slug}
```

Redirects to the original URL if active and not expired.


## Project Structure

```
src/
├── app.js                 # Express app configuration
├── index.js              # Server entry point
├── config/
│   ├── env.js           # Environment configuration
│   ├── mongo.js         # MongoDB connection
│   ├── prisma.js        # Prisma client initialization
│   ├── redis.js         # Redis connection
│   └── passport.js      # Google OAuth strategy
├── controllers/
│   ├── link.controller.js       # URL CRUD operations
│   ├── analytics.controller.js  # Analytics queries
│   └── shortUrl.controller.js   # URL redirect logic
├── routes/
│   ├── auth.routes.js   # Authentication routes
│   ├── url.routes.js    # Redirect and analytics routes
│   ├── link.routes.js   # Link management routes
│   └── map.routes.js    # Additional routes
├── middlewares/
│   └── auth.middleware.js  # Authentication verification
├── models/
│   ├── linkStats.model.js    # Analytics schema
│   └── clickEvent.model.js   # Click tracking schema
└── services/
    └── user.service.js       # User operations
```

### Prisma Models (PostgreSQL)

- **User**: Stores user profiles from Google OAuth
- **Workspace**: Isolated containers for users' short URLs and API keys
- **ShortUrl**: Individual short URL records with metadata
- **ApiKey**: API access credentials for programmatic usage

### MongoDB Collections

- **LinkStats**: Aggregated analytics per slug
- **ClickEvent**: Individual click records with metadata

## Configuration Files

- [.env-example](.env-example) - Environment variable template
- [prisma/schema.prisma](prisma/schema.prisma) - PostgreSQL schema definition
- [package.json](package.json) - Dependencies and scripts

## Development

### Available Scripts

```bash
# Start development server with hot reload
npm run dev

# Start production server
npm start

# Run tests (not configured)
npm test
```

### Testing with Postman

Import the provided Postman collections for testing:
- [postman/API Documentation #reference.postman_collection.json](postman/API%20Documentation%20%23reference.postman_collection.json)
- [postman/RESTful API Basics #blueprint.postman_collection.json](postman/RESTful%20API%20Basics%20%23blueprint.postman_collection.json)
- [postman/Data Visualization.postman_collection.json](postman/Data%20Visualization.postman_collection.json)

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Primary Database**: PostgreSQL (via Prisma ORM)
- **Analytics Database**: MongoDB
- **Session Store**: Redis
- **Authentication**: Passport.js with Google OAuth 2.0
- **Development**: Nodemon (hot reload)

## Key Dependencies

- `express` - Web framework
- `@prisma/client` - PostgreSQL ORM
- `mongoose` - MongoDB ODM
- `passport` & `passport-google-oauth20` - Authentication
- `express-session` & `connect-redis` - Session management
- `cors` - Cross-origin resource sharing
- `dotenv` - Environment variable management

## Support & Documentation

### Getting Help

- Check existing [Postman collections](postman/) for API examples
- Review [environment configuration](.env-example) template
- Examine [database schema](prisma/schema.prisma) for data structure
- Check controller implementations in [src/controllers](src/controllers) for business logic

### API Reference

The project includes detailed Postman collections with request/response examples:
- Authentication flows
- URL shortening operations
- Analytics endpoints
- Data visualization examples

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Use ES6 modules (already configured)
- Follow existing code structure and naming conventions
- Test endpoints with provided Postman collections
- Ensure environment variables are properly configured

## Troubleshooting

### Connection Issues

- **MongoDB**: Verify `MONGO_URI` connection string and network access
- **PostgreSQL**: Ensure `DATABASE_URL` is correct and database exists
- **Redis**: Confirm Redis instance is running and credentials are valid

### Google OAuth

- Verify Google OAuth credentials in `.env`
- Ensure `GOOGLE_CALLBACK_URL` matches Google Cloud Console configuration
- Check CORS origin settings in [src/app.js](src/app.js)

### Database Migrations

If you encounter database issues:
```bash
# Reset and re-run migrations
npx prisma migrate reset

# View migration status
npx prisma migrate status
```

## License

This project is licensed under the ISC License - see the LICENSE file for details.

## Maintainer

For questions or support, please open an issue in the repository.

---

**Last Updated**: May 2026  
**Version**: 1.0.0
