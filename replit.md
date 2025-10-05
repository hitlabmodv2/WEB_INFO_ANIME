# Overview

Nimeku API is a REST API service that provides anime information and streaming data from Indonesian anime subtitle sources. It integrates with the Jikan API (MyAnimeList) for comprehensive anime schedules, popular titles, search, and detailed metadata, and also scrapes data from samehadaku.mba.

The project includes a web-based frontend featuring real-time anime schedules with auto-updates, search capabilities, and detailed anime information pages with tabbed navigation for characters, episodes, videos, stats, reviews, recommendations, and pictures. The ambition is to provide a comprehensive, user-friendly anime information portal focused on the Indonesian audience.

## Recent Updates (October 5, 2025)

- **Anime Website Favicon** (v2.6): Professional anime icon for browser tabs
  - Added favicon.png to all website pages (index, detail, profile, user recommendations)
  - Icon sourced from Flaticon with anime-themed design
  - Improves brand identity and makes site recognizable in browser tabs
  - Properly configured in HTML head sections across all pages

- **User Profile Recommendations Display** (v2.5): Real-time user recommendation history with images
  - Added new API endpoint `/api/user-profile/:username/recommendations` for scraping MyAnimeList profile recommendations
  - Displays user's complete recommendation history with anime/manga pairs, images, descriptions, and dates
  - Card-based layout with side-by-side anime images and description text below
  - Mobile-responsive design with breakpoints for tablet (768px) and mobile (480px)
  - Successfully extracts 30 recommendations per page from MyAnimeList profiles
  - Shows real-time data including recommendation text and submission dates
  - Integrated into existing profile page with seamless navigation
  - Note: Scraper relies on MyAnimeList's current HTML structure (typical fragility for scraping-based features)

- **Anime Type Statistics in Schedule** (v2.4.2): Comprehensive breakdown of anime by type
  - Added real-time statistics display for all anime types: TV, ONA, OVA, Movie, Special
  - Visual cards with icons showing count for each type in the schedule section
  - Statistics appear when "Semua" (All) filter is selected on Schedule tab
  - Responsive grid layout: 2 columns (mobile), 3 columns (tablet), 5 columns (desktop)
  - Clean, modern design with gradient effects and hover animations
  - Shows accurate counts including zero values for types not present in current season
  - All data updates dynamically from MyAnimeList API via Jikan
  - **Icon Fix**: Fixed MOVIE (🎬) and SPECIAL (⭐) icons by using uppercase type keys consistently
  - **Accurate Real-Time Totals**: New backend endpoint fetches complete statistics across ALL anime in season (not just current page)
  - API requests use sequential delays (350ms) to respect Jikan rate limits (3 req/sec)
  - Statistics cached for 5 minutes to minimize API calls while maintaining real-time accuracy
  - **Mobile-Optimized Display**: Compact cards with responsive sizing for all screen sizes (480px-1024px+)
  - **Improved Info Text**: Clean two-line format showing total with bold emphasis and update source
  - Removed duplicate total display for cleaner UI
  - Helps users quickly see distribution of anime types for the current season

- **Real-Time Total Counts & Pagination Info** (v2.3): Enhanced data visibility with live statistics
  - Added total anime count display in Schedule tab with real-time data from MyAnimeList
  - Displays total count per day (Senin-Minggu) with overall total anime terjadwal
  - User Recommendations page shows total users count with real-time data
  - Recommendations tab displays current page number, items per page (100), and next page availability
  - All counters update dynamically from MyAnimeList API/scraping
  - Beautiful gradient cards with icons for stats display
  - Mobile-responsive design for all statistics cards

- **Enhanced Loading Animations & Page Transitions** (v2.2): Modern loading UX improvements
  - Added smooth page transition overlays with gradient animations to prevent white screen flash
  - Implemented `navigateWithTransition()` function across all pages for consistent navigation UX
  - Enhanced loading spinners with gradient shifts and modern bounce animations
  - Page fade-in effects on load with `page-loaded` class and CSS animations
  - Improved card hover effects with cubic-bezier easing for better visual feedback
  - Skeleton loaders with shimmer effect for content loading states
  - Modal animations with bounce and slide effects
  - Full-page transition overlay prevents jarring white screens between page navigations

- **User Recommendations & Profile Pages** (v2.0): Complete internal navigation system for browsing top users and their profiles
  - `/userrecs.html` displays top 50+ users ranked by recommendation count from MyAnimeList
  - Real-time scraping of user recommendation rankings (e.g., abystoma2 with 1,654 recommendations)
  - Grid layout with card design showing username and recommendation count
  - Clickable user cards navigate to internal profile pages
  - `/profile.html` shows user profiles with anime statistics and favorites
  - API endpoints: `/api/user-recommendations` (GET list) and `/api/user-profile/:username` (GET profile data)
  - Beautiful gradient design matching MyAnimeList brand colors (#2E51A2)
  - Fully integrated navigation - no external redirects to MyAnimeList
  - Data scraped in real-time using Cheerio for accuracy

- **MyAnimeList Quick Link Button**: Updated to navigate to internal user recommendations page
  - Button now opens `/userrecs.html` within the app instead of external link
  - Maintains beautiful blue gradient design matching MyAnimeList brand colors (#2E51A2)
  - Responsive design with hover effects and mobile optimization
  - Located at top of Rekomendasi tab for seamless navigation

- **Recommendations Pagination & Image Quality**: Enhanced recommendation viewing experience
  - Full pagination support with Previous/Next buttons (100 recommendations per page)
  - Upgraded to high-resolution anime posters (140x200px desktop, 120x170px mobile)
  - Fixed pagination state - currentPage resets to 1 when switching to Rekomendasi tab
  - Improved mobile design with larger, crisper images

- **Complete Profile Data & UX Improvements** (v2.1): Enhanced profile pages with complete real-time data
  - Fixed profile scraper to correctly extract all user information (Last Online, Gender, Birthday, Location, Joined)
  - Integrated Jikan API v4 for complete anime statistics (Days Watched, Mean Score, Watching, Completed, On-Hold, Dropped, Plan to Watch, Total Entries, Rewatched, Episodes)
  - Added Interest Stacks to user statistics display alongside Forum Posts, Reviews, Recommendations, Blog Posts, and Clubs
  - Added loading overlay indicator when navigating from user recommendations to profile for better UX
  - Mobile-responsive design with optimized layouts for all screen sizes (tablets and phones)

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Technology Stack**: Vanilla JavaScript, HTML5, CSS3

**Design Pattern**: Multi-page application (MPA) with `index.html` for main navigation, `detail.html` for comprehensive anime details, `userrecs.html` for user recommendations, and `profile.html` for user profiles. Client-side routing uses URL parameters. Real-time updates are handled via JavaScript `fetch` API with 5-minute auto-refresh intervals. Error handling is robust for API rate limits and server errors.

**UI/UX Decisions**:
- Tabbed navigation for main sections and detail pages.
- Responsive design for mobile, tablet, and desktop.
- Skeleton loaders and smooth fade-in transitions for images and content.
- Color-coded elements (e.g., daily schedule colors, type badges with gradient colors).
- Real-time "LIVE" indicators for currently airing anime.
- Pagination for navigation through lists and recommendations.
- Image modal viewer for detailed picture viewing.

## Backend Architecture

**Framework**: Express.js (Node.js)

**Architecture Pattern**: RESTful API with controller-based routing.

**Core Components**:
- **API Routes**: `jikanRoutes.js` for Jikan API integration, MyAnimeList scraping endpoints (user recommendations, user profiles), and `apiRoutes.js` for web scraping (currently a backup).
- **Controllers**: `jikanController.js` for transforming Jikan API responses to Indonesian and scraping MyAnimeList user data, and `scrapingController.js` for web scraping logic (legacy/backup).
- **Utilities**: `fetchPage.js` for HTTP requests with rate limiting, and `helper.js` for HTML parsing.

**Data Flow**: Frontend requests `/api/*` endpoints, Express routes to the controller, data is fetched from Jikan API, transformed (e.g., localized), and sent as a JSON response to the frontend.

## Deployment Architecture

**Platform**: Vercel (serverless)

**Configuration**: `vercel.json` defines a single entry point (`src/app.js`) with static files served from `/public`.

# External Dependencies

## Third-Party APIs

**Jikan API (api.jikan.moe/v4)**:
- **Purpose**: Primary data source for anime information.
- **Endpoints used**: Schedules, seasons, top anime, anime search and details, characters, episodes, videos, statistics, reviews, recommendations, and pictures.
- **Authentication**: Not required.
- **Rate Limiting**: Handled with built-in delays in the backend.

## Core Dependencies

- **axios**: HTTP client for API requests.
- **cheerio**: HTML parsing for web scraping functionality.
- **express**: Web application framework for the backend.
- **cors**: Middleware for Cross-Origin Resource Sharing.

## Data Sources

- **Primary**: Jikan API (MyAnimeList) - Structured JSON responses.
- **MyAnimeList Direct Scraping**: User recommendations page and user profile pages (scraped with cheerio).
- **Secondary**: samehadaku.mba - Indonesian anime subtitle website (scraping logic exists as a fallback).

## Hosting & Deployment

- **Vercel**: Serverless hosting platform for Node.js runtime and static file serving.