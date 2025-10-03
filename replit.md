# Overview

Nimeku API is a REST API service that provides anime information and streaming data from Indonesian anime subtitle sources. The application scrapes anime data from samehadaku.mba and also integrates with the Jikan API (MyAnimeList) to provide comprehensive anime information including schedules, popular titles, search functionality, and detailed anime metadata.

The project features a web-based frontend that displays real-time anime schedules with auto-updates, anime search capabilities, and detailed anime information pages with tabbed navigation for characters, episodes, videos, stats, reviews, and recommendations.

## Recent Changes (October 3, 2025)

### Latest Updates
- **Anime Recommendations Feature (NEW)**: Added new tab for real-time anime recommendations from MyAnimeList
  - **MyAnimeList Scraper**: Direct web scraping from https://myanimelist.net/recommendations.php?s=recentrecs&t=anime
  - **Real-Time Data**: Fetches 100 most recent anime recommendations from the community
  - **Recommendation Cards**: Beautiful card layout showing two anime being compared with user's recommendation text
  - **User Attribution**: Displays username, profile link, and timestamp for each recommendation
  - **Responsive Design**: Mobile-optimized cards with proper image loading and error handling
  - **API Endpoint**: `/api/mal-recommendations` provides JSON response with anime pairs and recommendation metadata
  - **Navigation Tab**: Added "💡 Rekomendasi" tab to main navigation for easy access
- **Type Badge System**: Implemented comprehensive type badge system across ALL tabs with gradient color-coding
  - **TV Badge**: Blue gradient (`#2196F3` → `#1976D2`) for TV anime
  - **Movie Badge**: Yellow gradient (`#FFC107` → `#FFA000`) for Movie anime
  - **OVA Badge**: Cyan gradient (`#00BCD4` → `#0097A7`) for OVA anime
  - **ONA Badge**: Pink gradient (`#E91E63` → `#C2185B`) for ONA anime
  - **Special Badge**: Teal gradient (`#009688` → `#00796B`) for Special anime
  - **Responsive Design**: Badges scale appropriately on mobile (0.6em font) and desktop (0.7em font)
- **Fixed Type Filtering System**: Corrected API parameters for accurate filtering across all tabs
  - **Schedule Tab (Jadwal)**: Now uses `/seasons/now` endpoint with `filter` parameter + full pagination support
  - **Currently Airing (Sedang Tayang)**: Uses `filter` parameter with `status=airing` for filtering
  - **Latest (Terbaru)**: Uses `filter` parameter for type filtering with pagination
  - **Season (Musim)**: Uses `filter` parameter for `/seasons/{year}/{season}` endpoint
  - **Popular (Populer)**: Uses `type` parameter for `/top/anime` endpoint
- **Verified API Parameters**: All endpoints tested and verified with curl to ensure correct parameter usage
  - Seasons endpoints (`/seasons/now`, `/seasons/{year}/{season}`): use `filter=<type>` parameter
  - Top anime endpoint (`/top/anime`): uses `type=<type>` parameter
- **Full Pagination Support**: All tabs now support proper pagination with distinct data sets per page
- **Filter Consistency**: Type filters (Semua, TV, ONA, OVA, Movie, Special) work correctly across all tabs

### Previous Updates (October 2, 2025)
- **Schedule Page Enhancements**: Major UI/UX improvements to the Schedule (Jadwal) tab
  - **No Pagination**: Removed pagination controls (Previous/Next buttons) exclusively from Schedule tab for cleaner viewing
  - **Anime Thumbnails**: Added small poster images (45x63px mobile, 50x70px desktop, 60x84px tablet) to every schedule item with smooth hover zoom effect
  - **Skeleton Loader**: Shimmer loading animation for thumbnails prevents white screen during image loading - smooth fade-in transition when images load
  - **Color-Coded Days**: Each day of the week (Monday-Sunday) now has unique color scheme - Senin (red), Selasa (teal), Rabu (yellow), Kamis (green), Jumat (purple), Sabtu (pink), Minggu (orange)
  - **LIVE Badge in Schedule**: Real-time LIVE indicator appears on anime currently airing in the schedule list, using Tokyo timezone with -5 to +30 minute detection window
  - **Responsive Design**: All schedule elements optimized for mobile, tablet, and desktop viewing
- **Real-Time LIVE Indicator**: Added automatic LIVE badge detection for "Sedang Tayang" tab - shows red pulsing LIVE badge on anime currently airing based on JST broadcast time
- **Smart Anime Grouping**: "Sedang Tayang" tab now separates anime into "🔴 LIVE SEKARANG" (currently airing) and "📺 Sedang Tayang Musim Ini" (upcoming) sections
- **Timezone-Aware Detection**: LIVE detection automatically converts to Japan Standard Time (JST) for accurate broadcast matching, with 5-minute pre-show and 30-minute post-show window
- **Animated LIVE Badge**: Red pulsing badge with animated white dot indicator appears on anime cards during broadcast time
- **Auto-Refresh Integration**: 5-minute auto-refresh maintains real-time LIVE status updates across all tabs
- **Pagination System**: Replaced infinite scroll with proper pagination - now showing "Previous" and "Next" buttons with current page number for better navigation
- **Filter by Type**: Each type filter (Semua, TV, ONA, OVA, Movie, Special) now works independently with pagination support - click "TV" to see only TV anime, "Movie" for movies, etc.
- **Grouped Display**: "Semua" button shows all anime organized by type (TV, ONA, OVA, Movie, Special) with color-coded section headers
- **Fixed White Screen Issue**: Replaced window.open() with modal/lightbox for Pictures tab - images now open in-page with smooth loading animation
- **Image Modal Viewer**: Added full-screen modal for viewing anime pictures with loading indicator, click-outside to close, and Escape key support
- **Always-Visible Captions**: Image captions now always visible showing anime title, rating (score), and release schedule information
- **Enhanced Caption Info**: Each anime card displays title, type badge, score rating, and broadcast/release schedule when available
- **Mobile-Optimized Filter Buttons**: Reduced button sizes to 5px-10px padding on mobile (0.7em font) for better mobile screen fit, scaling up on larger screens
- **Type Section Headers**: Beautiful section headers with color-coded borders (blue for TV, pink for ONA, cyan for OVA, yellow for Movie, teal for Special)
- **Type Badge Indicators**: Visual badges on every anime card showing type (TV/ONA/OVA/Movie/Special) with unique gradient colors for easy identification
- **Duplicate Prevention**: Fixed bug where duplicate images appeared during infinite scroll - now properly checks existing IDs before appending
- **Image Grid Display**: Revamped to show only anime images in responsive grid layout with always-visible captions
- **Mini Filter Buttons**: Added compact type filter buttons (Semua, TV, ONA, OVA, Movie, Special) optimized for mobile with horizontal scroll
- **Infinite Scroll**: Replaced pagination with infinite scroll - new anime automatically load when scrolling to bottom
- **Smart Image Loading**: Individual loader for each image to prevent white screen, with lazy loading and fade-in animation
- **Enhanced Loading States**: Improved loading animations with proper skeleton loaders
- **Auto-Update Maintained**: 5-minute auto-refresh still active and maintains current type filter selection
- **Responsive Design**: Filter buttons and badges adjust size based on screen - smaller on mobile, larger on desktop
- **Smooth Transitions**: All images fade in smoothly when loaded, improving user experience

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