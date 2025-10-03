# Overview

Nimeku API is a REST API service that provides anime information and streaming data from Indonesian anime subtitle sources. It integrates with the Jikan API (MyAnimeList) for comprehensive anime schedules, popular titles, search, and detailed metadata, and also scrapes data from samehadaku.mba.

The project includes a web-based frontend featuring real-time anime schedules with auto-updates, search capabilities, and detailed anime information pages with tabbed navigation for characters, episodes, videos, stats, reviews, recommendations, and pictures. The ambition is to provide a comprehensive, user-friendly anime information portal focused on the Indonesian audience.

## Recent Updates (October 3, 2025)

- **User Recommendations & Profile Pages**: Added internal pages for browsing user recommendations and viewing user profiles
  - New `/userrecs.html` page displays top user recommendations from MyAnimeList (scraped from userrecs page)
  - New `/profile.html` page shows detailed user profiles with stats, favorites, and personal information
  - Scrapes data directly from MyAnimeList using cheerio for accurate real-time data
  - Beautiful gradient design matching MyAnimeList brand colors (#2E51A2)
  - Clickable usernames in recommendations navigate to internal profile pages
  - Full pagination support (100 recommendations per page)
  - Back navigation buttons for easy app flow
  - API endpoints: `/api/user-recommendations` and `/api/user-profile/:username`

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