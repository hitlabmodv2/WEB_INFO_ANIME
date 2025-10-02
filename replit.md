# Overview

Nimeku API is a REST API service that provides anime information and streaming data from Indonesian anime subtitle sources. The application scrapes anime data from samehadaku.mba and also integrates with the Jikan API (MyAnimeList) to provide comprehensive anime information including schedules, popular titles, search functionality, and detailed anime metadata.

The project features a web-based frontend that displays real-time anime schedules with auto-updates, anime search capabilities, and detailed anime information pages with tabbed navigation for characters, episodes, videos, stats, reviews, and recommendations.

## Recent Changes (October 2, 2025)

### Latest Updates
- **Pagination System**: Implemented complete pagination with 10 items per page across all tabs (Schedule, Latest, Popular, Season)
- **Type Filtering**: Added universal anime type filters (TV, ONA, OVA, Movie, Special) with server-side filtering via Jikan API
- **Advanced Navigation**: 5 pagination buttons - First (⏮), Previous (←), Page Info, Next (→), Last (⏭) with auto-scroll to top
- **Loading Animations**: Smooth 1-100% progress animation when navigating to anime details and returning to home page
- **Enhanced UX**: Pagination positioned below content for better user flow

### Previous Updates
- Implemented dedicated detail page (`detail.html`) with comprehensive anime information
- Added 7 new API endpoints for MyAnimeList data: characters, episodes, videos, statistics, reviews, recommendations, and pictures
- Enhanced error handling to properly manage Jikan API rate limits and server errors (response.ok checks before JSON parsing)
- Replaced modal implementation with separate detail page for better viewing experience
- Added mobile-responsive design for detail page with tabbed navigation
- Implemented lazy loading for detail tabs to optimize performance

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Technology Stack**: Vanilla JavaScript, HTML5, CSS3

**Design Pattern**: The frontend uses a simple multi-page application (MPA) approach with:
- `index.html` - Main landing page with tabbed navigation for schedule, new releases, popular anime, and search
- `detail.html` - Anime detail page with comprehensive tabbed information (Details, Characters, Episodes, Videos, Stats, Reviews, Recommendations, Pictures)
- `script.js` - Main page logic for tabs, search, and auto-refresh
- `detail.js` - Detail page logic with lazy tab loading and error handling
- `style.css` - Main page mobile-responsive styling
- `detail.css` - Detail page styling with responsive grid layouts
- Client-side routing via URL parameters for navigation
- Real-time updates using JavaScript fetch API with 5-minute auto-refresh intervals
- Robust error handling for API rate limits and server errors

**Rationale**: Vanilla JavaScript was chosen over frameworks to keep the application lightweight and serverless-deployment friendly. The MPA approach simplifies navigation while maintaining fast load times. Lazy loading prevents unnecessary API calls and improves performance.

## Backend Architecture

**Framework**: Express.js (Node.js)

**Architecture Pattern**: RESTful API with controller-based routing

**Core Components**:
1. **API Routes** - Two separate routing systems:
   - `jikanRoutes.js` - Handles Jikan API (MyAnimeList) integration
   - `apiRoutes.js` - Handles web scraping operations (currently unused in active codebase)

2. **Controllers**:
   - `jikanController.js` - Transforms Jikan API responses into localized Indonesian format
   - `scrapingController.js` - Web scraping logic using Cheerio (legacy/backup functionality)

3. **Utilities**:
   - `fetchPage.js` - Axios wrapper with custom headers and rate limiting (1-second delay between requests)
   - `helper.js` - HTML parsing utilities

**Rationale**: Express.js provides a minimal, flexible foundation for API development. The dual-route architecture allows switching between Jikan API and web scraping as data sources, providing fallback options if one source fails.

## Data Flow

**Primary Data Source**: Jikan API (api.jikan.moe/v4) - Official MyAnimeList API
**Backup Data Source**: Web scraping from samehadaku.mba (implemented but not actively used)

The application follows this data flow:
1. Frontend makes requests to `/api/*` endpoints
2. Express server routes to appropriate controller
3. Controller fetches data from Jikan API
4. Response is transformed (e.g., day names translated to Indonesian)
5. JSON response sent back to frontend
6. Frontend renders data with appropriate UI components

**Rationale**: Using Jikan API as the primary source ensures reliable, structured data with comprehensive anime information. Web scraping serves as a backup for Indonesia-specific content.

## Deployment Architecture

**Platform**: Vercel (serverless)

**Configuration**: 
- `vercel.json` defines single entry point (`src/app.js`)
- All routes redirect to main application
- Static files served from `/public` directory

**Pros**: 
- Zero-cost hosting for small projects
- Automatic HTTPS and global CDN
- Simple deployment workflow

**Cons**:
- Serverless cold starts may cause initial request delays
- 10-second execution timeout may affect scraping operations

# External Dependencies

## Third-Party APIs

**Jikan API (api.jikan.moe/v4)**
- Purpose: Primary data source for anime information
- Endpoints used:
  - `/schedules` - Weekly anime broadcast schedules
  - `/seasons/now` - Current season anime
  - `/top/anime` - Popular anime rankings
  - `/anime` - Search and detailed anime information
  - `/anime/{id}/characters` - Character information
  - `/anime/{id}/episodes` - Episode lists
  - `/anime/{id}/videos` - Promotional videos and trailers
  - `/anime/{id}/statistics` - View statistics
  - `/anime/{id}/reviews` - User reviews
  - `/anime/{id}/recommendations` - Related anime suggestions
  - `/anime/{id}/pictures` - Anime artwork and screenshots
- No authentication required
- Rate limiting: Built-in delays (1 second) to respect API limits

## Core Dependencies

**axios (^1.7.2)**: HTTP client for API requests and web scraping
**cheerio (^1.0.0-rc.12)**: jQuery-like HTML parsing for web scraping functionality
**express (^4.19.2)**: Web application framework
**cors (^2.8.5)**: Cross-Origin Resource Sharing middleware

## Additional Dependencies (Legacy/Unused)

**puppeteer (^22.15.0) & puppeteer-core (^9.1.1)**: Headless browser automation (included but not actively used in current implementation)
**chrome-aws-lambda (^9.1.0)**: Chromium binary for serverless environments (included for potential future use)
**string-similarity (^4.0.4)**: String comparison utilities (included but not actively used)
**cors-anywhere (^0.4.4)**: CORS proxy (included but not actively used)

## Data Sources

**Primary**: Jikan API (MyAnimeList) - Structured JSON responses
**Secondary**: samehadaku.mba - Indonesian anime subtitle website (scraping logic implemented as fallback)

## Hosting & Deployment

**Vercel**: Serverless hosting platform
- Node.js runtime environment
- Static file serving
- Automatic SSL/TLS certificates