# Overview

Nimeku API is a REST API service providing anime information and streaming data from Indonesian anime subtitle sources. It integrates with the Jikan API (MyAnimeList) for comprehensive anime schedules, popular titles, search, and detailed metadata, and also scrapes data from samehadaku.mba. The project includes a web-based frontend featuring real-time anime schedules with auto-updates, search capabilities, and detailed anime information pages with tabbed navigation for characters, episodes, videos, stats, reviews, recommendations, and pictures. The ambition is to provide a comprehensive, user-friendly anime information portal focused on the Indonesian audience. Key capabilities include a genre browser, full dark mode coverage, enhanced mobile UX with an integrated video player, dynamic time-based backgrounds, and detailed user profile and recommendation displays.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Technology Stack**: Vanilla JavaScript, HTML5, CSS3

**Design Pattern**: Multi-page application (MPA) with `index.html` for main navigation, `detail.html` for comprehensive anime details, `userrecs.html` for user recommendations, and `profile.html` for user profiles. Client-side routing uses URL parameters. Real-time updates are handled via JavaScript `fetch` API with 5-minute auto-refresh intervals.

**UI/UX Decisions**:
- Tabbed navigation for main sections and detail pages.
- Responsive design for mobile, tablet, and desktop.
- Skeleton loaders and smooth fade-in transitions.
- Color-coded elements and real-time "LIVE" indicators.
- Pagination for navigation.
- Image modal viewer.
- Integrated YouTube video player modal.
- Dynamic time-based background system with 40 Kimi no Nawa anime scenes (10 per time period: pagi/siang/sore/malam) that rotate every minute based on Asia/Jakarta timezone.
- Comprehensive dark mode styling with a persistent toggle.
- Genre browser with fuzzy search and auto-complete.
- Mobile-optimized UX (max-width: 768px):
  - Bottom Navigation Bar with quick access to main sections (Jadwal, Tayang, Cari, Genre).
  - Floating Action Button (FAB) with quick actions menu for Rekomendasi, Musim, and Populer.
  - Pull-to-Refresh gesture support for data updates.
  - Swipe gestures for tab navigation with visual indicators.
  - Touch-optimized targets (minimum 44px) for all interactive elements.
  - Proper z-index layering: pull-to-refresh/swipe (10000), scroll-to-top (9999), bottom nav (9998), FAB (9997), quick actions (9996).

## Backend Architecture

**Framework**: Express.js (Node.js)

**Architecture Pattern**: RESTful API with controller-based routing.

**Core Components**:
- **API Routes**: Jikan API integration, MyAnimeList scraping endpoints (user recommendations, user profiles), and web scraping (fallback).
- **Controllers**: Transform Jikan API responses and handle MyAnimeList user data scraping, and web scraping logic.
- **Utilities**: HTTP requests with rate limiting, and HTML parsing.

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