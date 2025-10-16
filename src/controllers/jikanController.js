import axios from 'axios';
import { load } from 'cheerio';
import { fetchPage } from '../utils/fetchPage.js';

const JIKAN_BASE = 'https://api.jikan.moe/v4';

let typeStatsCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000;

let genresCache = null;
let genresCacheTimestamp = null;
const GENRES_CACHE_DURATION = 24 * 60 * 60 * 1000;

let genreAnimeCache = {};
let genreAnimeCacheTimestamp = {};
const GENRE_ANIME_CACHE_DURATION = 10 * 60 * 1000;

let scheduleCache = {};
const SCHEDULE_CACHE_DURATION = 5 * 60 * 1000;

let lastRequestTime = 0;
const MIN_REQUEST_DELAY = 1000;

async function delayIfNeeded() {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < MIN_REQUEST_DELAY) {
    const delay = MIN_REQUEST_DELAY - timeSinceLastRequest;
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  lastRequestTime = Date.now();
}

export const getSchedule = async (req, res) => {
  try {
    const { type, page = 1, day } = req.query;
    const now = Date.now();
    
    const baseCacheKey = `${day || 'all'}_${type || 'all'}`;
    const fullCacheKey = `${baseCacheKey}_page_${page}`;
    
    const cachedEntry = scheduleCache[fullCacheKey];
    if (cachedEntry && (now - cachedEntry.cachedAt < SCHEDULE_CACHE_DURATION)) {
      return res.json(cachedEntry.data);
    }
    
    await delayIfNeeded();
    
    const dayMapping = {
      'monday': 'Senin',
      'tuesday': 'Selasa',
      'wednesday': 'Rabu',
      'thursday': 'Kamis',
      'friday': 'Jumat',
      'saturday': 'Sabtu',
      'sunday': 'Minggu',
      'mondays': 'Senin',
      'tuesdays': 'Selasa',
      'wednesdays': 'Rabu',
      'thursdays': 'Kamis',
      'fridays': 'Jumat',
      'saturdays': 'Sabtu',
      'sundays': 'Minggu',
      'senin': 'Senin',
      'selasa': 'Selasa',
      'rabu': 'Rabu',
      'kamis': 'Kamis',
      'jumat': 'Jumat',
      'sabtu': 'Sabtu',
      'minggu': 'Minggu'
    };

    let allScheduleData = [];
    
    if (type && ['ona', 'ova', 'movie', 'special'].includes(type.toLowerCase())) {
      let currentPage = 1;
      let hasNextPage = true;
      const maxPages = 5;
      
      while (hasNextPage && currentPage <= maxPages) {
        try {
          if (currentPage > 1) {
            await delayIfNeeded();
          }
          
          const params = { 
            page: currentPage,
            limit: 25,
            type: type.toLowerCase()
          };
          
          const response = await axios.get(`${JIKAN_BASE}/seasons/now`, { params });
          
          if (response.data && response.data.data && response.data.data.length > 0) {
            const pageData = response.data.data
              .filter(anime => anime.broadcast && anime.broadcast.day && anime.broadcast.time)
              .map(anime => {
                const broadcastDay = anime.broadcast?.day || 'unknown';
                const indonesianDay = dayMapping[broadcastDay.toLowerCase()] || 'Tidak Diketahui';
                
                return {
                  mal_id: anime.mal_id,
                  title: anime.title,
                  image: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
                  day: indonesianDay,
                  time: anime.broadcast?.time || 'TBA',
                  aired: anime.aired?.string || 'TBA',
                  airedFrom: anime.aired?.from || null,
                  episode: `Episodes: ${anime.episodes || '?'}`,
                  score: anime.score,
                  type: anime.type,
                  status: anime.status,
                  broadcast: anime.broadcast
                };
              });
            
            allScheduleData = allScheduleData.concat(pageData);
            
            hasNextPage = response.data.pagination?.has_next_page || false;
            currentPage++;
          } else {
            hasNextPage = false;
          }
        } catch (pageError) {
          console.error(`Error fetching ${type} page ${currentPage}:`, pageError.message);
          hasNextPage = false;
        }
      }
    } else {
      let currentPage = 1;
      let hasNextPage = true;
      const maxPages = 10;
      
      while (hasNextPage && currentPage <= maxPages) {
        try {
          if (currentPage > 1) {
            await delayIfNeeded();
          }
          
          const params = { page: currentPage };
          
          if (day) {
            params.filter = day.toLowerCase();
          }
          
          const response = await axios.get(`${JIKAN_BASE}/schedules`, { params });
          
          if (response.data && response.data.data && response.data.data.length > 0) {
            const pageData = response.data.data.map(anime => {
              const broadcastDay = anime.broadcast?.day || 'unknown';
              const indonesianDay = dayMapping[broadcastDay.toLowerCase()] || 'Tidak Diketahui';
              
              return {
                mal_id: anime.mal_id,
                title: anime.title,
                image: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
                day: indonesianDay,
                time: anime.broadcast?.time || 'TBA',
                aired: anime.aired?.string || 'TBA',
                airedFrom: anime.aired?.from || null,
                episode: `Episodes: ${anime.episodes || '?'}`,
                score: anime.score,
                type: anime.type,
                status: anime.status,
                broadcast: anime.broadcast
              };
            });
            
            allScheduleData = allScheduleData.concat(pageData);
            
            hasNextPage = response.data.pagination?.has_next_page || false;
            currentPage++;
          } else {
            hasNextPage = false;
          }
        } catch (pageError) {
          console.error(`Error fetching schedule page ${currentPage}:`, pageError.message);
          hasNextPage = false;
        }
      }
      
      if (type && type !== 'all' && type !== '' && type.toLowerCase() === 'tv') {
        allScheduleData = allScheduleData.filter(anime => 
          anime.type && anime.type.toLowerCase() === 'tv'
        );
      }
    }

    allScheduleData.sort((a, b) => {
      const dayOrder = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
      const dayDiff = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
      if (dayDiff !== 0) return dayDiff;
      
      const timeA = a.time || '99:99';
      const timeB = b.time || '99:99';
      return timeA.localeCompare(timeB);
    });

    const pageNum = parseInt(page);
    const itemsPerPage = 100;
    const startIdx = (pageNum - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    const paginatedData = allScheduleData.slice(startIdx, endIdx);
    const totalPages = Math.ceil(allScheduleData.length / itemsPerPage);

    const result = {
      data: paginatedData,
      pagination: {
        currentPage: pageNum,
        totalPages: totalPages,
        totalItems: allScheduleData.length,
        itemsPerPage: itemsPerPage,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    };

    scheduleCache[fullCacheKey] = {
      data: result,
      cachedAt: now
    };

    res.json(result);
  } catch (error) {
    console.error('Jikan API Error:', error.message);
    res.status(500).json({ error: 'Gagal mengambil jadwal anime' });
  }
};

export const getCurrentSeason = async (req, res) => {
  try {
    const { type, page = 1 } = req.query;
    const params = { 
      page: parseInt(page),
      limit: 25
    };
    
    if (type && type !== 'all' && type !== '') {
      params.type = type.toLowerCase();
    }
    
    const response = await axios.get(`${JIKAN_BASE}/seasons/now`, { params });

    let data = response.data.data.map(anime => ({
      mal_id: anime.mal_id,
      title: anime.title,
      image: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
      type: anime.type,
      score: anime.score,
      status: anime.status,
      episodes: anime.episodes,
      synopsis: anime.synopsis,
      broadcast: anime.broadcast,
      aired: anime.aired,
      duration: anime.duration,
      members: anime.members,
      genres: anime.genres,
      studios: anime.studios,
      source: anime.source,
      themes: anime.themes,
      demographics: anime.demographics
    }));

    const pagination = response.data.pagination || {};

    res.json({
      data: data,
      pagination: {
        currentPage: pagination.current_page || parseInt(page),
        totalPages: pagination.last_visible_page || 1,
        totalItems: pagination.items?.total || data.length,
        itemsPerPage: pagination.items?.per_page || 25,
        hasNextPage: pagination.has_next_page || false,
        hasPrevPage: (parseInt(page) > 1)
      }
    });
  } catch (error) {
    console.error('Jikan API Error:', error.message);
    res.status(500).json({ error: 'Gagal mengambil anime terbaru' });
  }
};

export const getTypeStatistics = async (req, res) => {
  try {
    const now = Date.now();
    
    if (typeStatsCache && cacheTimestamp && (now - cacheTimestamp < CACHE_DURATION)) {
      return res.json(typeStatsCache);
    }

    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
    let allAnime = [];
    let page = 1;
    let hasNextPage = true;
    
    while (hasNextPage && page <= 5) {
      try {
        if (page > 1) {
          await delay(500);
        }
        
        const response = await axios.get(`${JIKAN_BASE}/seasons/now`, { 
          params: { 
            page: page,
            limit: 25
          }
        });
        
        if (response.data && response.data.data) {
          allAnime = allAnime.concat(response.data.data);
          hasNextPage = response.data.pagination?.has_next_page || false;
          page++;
        } else {
          hasNextPage = false;
        }
      } catch (error) {
        console.error(`Error fetching page ${page}:`, error.message);
        hasNextPage = false;
      }
    }

    const statistics = {
      TV: 0,
      ONA: 0,
      OVA: 0,
      MOVIE: 0,
      SPECIAL: 0,
      SCHEDULE: 0,
      TOTAL: allAnime.length
    };
    
    allAnime.forEach(anime => {
      const type = anime.type?.toUpperCase();
      if (statistics.hasOwnProperty(type)) {
        statistics[type]++;
      }
      
      if (anime.broadcast && anime.broadcast.day && anime.broadcast.time) {
        statistics.SCHEDULE++;
      }
    });

    typeStatsCache = statistics;
    cacheTimestamp = now;

    res.json(statistics);
  } catch (error) {
    console.error('Type Statistics API Error:', error.message);
    res.status(500).json({ error: 'Gagal mengambil statistik tipe anime' });
  }
};

export const getSeasonalAnime = async (req, res) => {
  try {
    const { type, year, season, page = 1 } = req.query;
    const params = { 
      page: parseInt(page),
      limit: 25
    };
    
    if (type && type !== 'all' && type !== '') {
      params.type = type.toLowerCase();
    }

    let url = `${JIKAN_BASE}/seasons/now`;
    if (year && season) {
      url = `${JIKAN_BASE}/seasons/${year}/${season}`;
    }

    const response = await axios.get(url, { params });

    let data = response.data.data.map(anime => ({
      id: anime.mal_id,
      mal_id: anime.mal_id,
      title: anime.title,
      image: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
      type: anime.type,
      score: anime.score,
      status: anime.status,
      episodes: anime.episodes,
      synopsis: anime.synopsis,
      broadcast: anime.broadcast,
      aired: anime.aired,
      duration: anime.duration,
      members: anime.members,
      genres: anime.genres,
      studios: anime.studios,
      source: anime.source,
      themes: anime.themes,
      demographics: anime.demographics
    }));

    const pagination = response.data.pagination || {};

    res.json({
      data: data,
      pagination: {
        currentPage: pagination.current_page || parseInt(page),
        totalPages: pagination.last_visible_page || 1,
        totalItems: pagination.items?.total || data.length,
        itemsPerPage: pagination.items?.per_page || 25,
        hasNextPage: pagination.has_next_page || false,
        hasPrevPage: (parseInt(page) > 1)
      }
    });
  } catch (error) {
    console.error('Jikan API Error:', error.message);
    res.status(500).json({ error: 'Gagal mengambil anime musiman' });
  }
};

export const getAnimeDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.get(`${JIKAN_BASE}/anime/${id}`);
    const anime = response.data.data;

    const detailData = {
      mal_id: anime.mal_id,
      title: anime.title,
      titleEnglish: anime.title_english,
      titleJapanese: anime.title_japanese,
      imageSrc: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
      description: anime.synopsis,
      aired: anime.aired?.string || 'TBA',
      airedFrom: anime.aired?.from,
      airedTo: anime.aired?.to,
      premiered: anime.season && anime.year ? `${anime.season} ${anime.year}` : 'TBA',
      duration: anime.duration,
      status: anime.status,
      malScore: anime.score,
      rating: anime.rating,
      rank: anime.rank,
      popularity: anime.popularity,
      members: anime.members,
      favorites: anime.favorites,
      genres: anime.genres?.map(g => g.name) || [],
      studios: anime.studios?.map(s => s.name) || [],
      producers: anime.producers?.map(p => p.name) || [],
      type: anime.type,
      episodes: anime.episodes,
      source: anime.source,
      broadcast: anime.broadcast?.string || 'TBA'
    };

    res.json(detailData);
  } catch (error) {
    console.error('Jikan API Error:', error.message);
    res.status(500).json({ error: 'Gagal mengambil detail anime' });
  }
};

export const getCurrentlyAiring = async (req, res) => {
  try {
    const { type, page = 1 } = req.query;
    const params = { 
      page: parseInt(page),
      limit: 25,
      status: 'airing'
    };
    
    if (type && type !== 'all' && type !== '') {
      params.type = type.toLowerCase();
    }
    
    const response = await axios.get(`${JIKAN_BASE}/seasons/now`, { params });

    let data = response.data.data.map(anime => ({
      mal_id: anime.mal_id,
      title: anime.title,
      image: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
      type: anime.type,
      score: anime.score,
      status: anime.status,
      episodes: anime.episodes,
      synopsis: anime.synopsis,
      broadcast: anime.broadcast,
      aired: anime.aired,
      duration: anime.duration,
      members: anime.members,
      genres: anime.genres,
      studios: anime.studios,
      source: anime.source,
      themes: anime.themes,
      demographics: anime.demographics
    }));

    const pagination = response.data.pagination || {};

    res.json({
      data: data,
      pagination: {
        currentPage: pagination.current_page || parseInt(page),
        totalPages: pagination.last_visible_page || 1,
        totalItems: pagination.items?.total || data.length,
        itemsPerPage: pagination.items?.per_page || 25,
        hasNextPage: pagination.has_next_page || false,
        hasPrevPage: (parseInt(page) > 1)
      }
    });
  } catch (error) {
    console.error('Jikan API Error:', error.message);
    res.status(500).json({ error: 'Gagal mengambil anime yang sedang tayang' });
  }
};

export const getPopular = async (req, res) => {
  try {
    const { type, page = 1 } = req.query;
    const params = { 
      page: parseInt(page),
      limit: 25
    };
    
    if (type && type !== 'all' && type !== '') {
      params.type = type.toLowerCase();
    }
    
    const response = await axios.get(`${JIKAN_BASE}/top/anime`, { params });

    let data = response.data.data.map(anime => ({
      mal_id: anime.mal_id,
      title: anime.title,
      image: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
      type: anime.type,
      score: anime.score,
      status: anime.status,
      rank: anime.rank,
      broadcast: anime.broadcast,
      aired: anime.aired,
      episodes: anime.episodes,
      synopsis: anime.synopsis,
      duration: anime.duration,
      members: anime.members,
      genres: anime.genres,
      studios: anime.studios,
      source: anime.source,
      themes: anime.themes,
      demographics: anime.demographics
    }));

    const pagination = response.data.pagination || {};

    res.json({
      data: data,
      pagination: {
        currentPage: pagination.current_page || parseInt(page),
        totalPages: pagination.last_visible_page || 1,
        totalItems: pagination.items?.total || data.length,
        itemsPerPage: pagination.items?.per_page || 25,
        hasNextPage: pagination.has_next_page || false,
        hasPrevPage: (parseInt(page) > 1)
      }
    });
  } catch (error) {
    console.error('Jikan API Error:', error.message);
    res.status(500).json({ error: 'Gagal mengambil anime populer' });
  }
};

export const searchAnime = async (req, res) => {
  try {
    const { keyword } = req.params;
    const response = await axios.get(`${JIKAN_BASE}/anime`, {
      params: { q: keyword, limit: 25 }
    });

    const data = response.data.data.map(anime => ({
      mal_id: anime.mal_id,
      title: anime.title,
      image: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
      type: anime.type,
      score: anime.score,
      status: anime.status,
      episodes: anime.episodes,
      synopsis: anime.synopsis,
      broadcast: anime.broadcast,
      aired: anime.aired,
      duration: anime.duration,
      members: anime.members,
      genres: anime.genres,
      studios: anime.studios,
      source: anime.source,
      themes: anime.themes,
      demographics: anime.demographics
    }));

    res.json(data);
  } catch (error) {
    console.error('Jikan API Error:', error.message);
    res.status(500).json({ error: 'Gagal mencari anime' });
  }
};

export const getCharacters = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.get(`${JIKAN_BASE}/anime/${id}/characters`);
    res.json(response.data.data);
  } catch (error) {
    console.error('Jikan API Error:', error.message);
    res.status(500).json({ error: 'Gagal mengambil karakter' });
  }
};

export const getEpisodes = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.get(`${JIKAN_BASE}/anime/${id}/episodes`);
    res.json(response.data.data);
  } catch (error) {
    console.error('Jikan API Error:', error.message);
    res.status(500).json({ error: 'Gagal mengambil episode' });
  }
};

export const getVideos = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.get(`${JIKAN_BASE}/anime/${id}/videos`);
    res.json(response.data.data);
  } catch (error) {
    console.error('Jikan API Error:', error.message);
    res.status(500).json({ error: 'Gagal mengambil video' });
  }
};

export const getStats = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.get(`${JIKAN_BASE}/anime/${id}/statistics`);
    res.json(response.data.data);
  } catch (error) {
    console.error('Jikan API Error:', error.message);
    res.status(500).json({ error: 'Gagal mengambil statistik' });
  }
};

export const getReviews = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.get(`${JIKAN_BASE}/anime/${id}/reviews`);
    res.json(response.data.data);
  } catch (error) {
    console.error('Jikan API Error:', error.message);
    res.status(500).json({ error: 'Gagal mengambil review' });
  }
};

export const getRecommendations = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.get(`${JIKAN_BASE}/anime/${id}/recommendations`);
    res.json(response.data.data);
  } catch (error) {
    console.error('Jikan API Error:', error.message);
    res.status(500).json({ error: 'Gagal mengambil rekomendasi' });
  }
};

export const getPictures = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.get(`${JIKAN_BASE}/anime/${id}/pictures`);
    res.json(response.data.data);
  } catch (error) {
    console.error('Jikan API Error:', error.message);
    res.status(500).json({ error: 'Gagal mengambil gambar' });
  }
};

export const getAnimeRecommendations = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const show = 100;
    
    const url = `https://myanimelist.net/recommendations.php?s=recentrecs&t=anime&show=${(page - 1) * show}`;
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      }
    });
    const html = response.data;
    const $ = load(html);

    const recommendations = [];
    
    const recTexts = $('.recommendations-user-recs-text');
    
    recTexts.each((index, element) => {
      try {
        const leftAnime = {};
        const rightAnime = {};
        
        const currentElement = $(element);
        
        const prevTable = currentElement.prev('table');
        const picSurrounds = prevTable.find('.picSurround').toArray().map(el => $(el));
        
        if (picSurrounds.length >= 2) {
          const leftLink = picSurrounds[0].find('a').first();
          leftAnime.url = leftLink.attr('href');
          leftAnime.mal_id = leftAnime.url ? leftAnime.url.match(/\/anime\/(\d+)\//)?.[1] : null;
          const leftImgAlt = leftLink.find('img').attr('alt') || '';
          leftAnime.title = leftImgAlt.replace('Anime: ', '').trim();
          let leftImage = leftLink.find('img').attr('data-src') || leftLink.find('img').attr('src');
          if (leftImage && leftImage.includes('/r/50x70/')) {
            leftImage = leftImage.replace('/r/50x70/', '/');
          }
          leftAnime.image = leftImage;
          
          const rightLink = picSurrounds[1].find('a').first();
          rightAnime.url = rightLink.attr('href');
          rightAnime.mal_id = rightAnime.url ? rightAnime.url.match(/\/anime\/(\d+)\//)?.[1] : null;
          const rightImgAlt = rightLink.find('img').attr('alt') || '';
          rightAnime.title = rightImgAlt.replace('Anime: ', '').trim();
          let rightImage = rightLink.find('img').attr('data-src') || rightLink.find('img').attr('src');
          if (rightImage && rightImage.includes('/r/50x70/')) {
            rightImage = rightImage.replace('/r/50x70/', '/');
          }
          rightAnime.image = rightImage;
        }
        
        const recommendationText = $(element).text().trim();
        
        const userSection = $(element).next('.lightLink.spaceit');
        const userLink = userSection.find('a[href^="/profile/"]');
        const username = userLink.text().trim();
        const userUrl = userLink.attr('href');
        
        const fullText = userSection.text();
        const dateMatch = fullText.match(/- (.+)$/);
        const dateText = dateMatch ? dateMatch[1].trim() : '';
        
        if (leftAnime.title && rightAnime.title && recommendationText) {
          recommendations.push({
            leftAnime,
            rightAnime,
            recommendation: recommendationText,
            user: {
              username,
              url: userUrl ? `https://myanimelist.net${userUrl}` : null
            },
            date: dateText
          });
        }
      } catch (err) {
        console.error('Error parsing recommendation item:', err.message);
      }
    });

    const hasNextPage = recommendations.length >= show;

    res.json({
      success: true,
      count: recommendations.length,
      data: recommendations,
      pagination: {
        currentPage: page,
        hasNextPage: hasNextPage,
        show: show
      }
    });
  } catch (error) {
    console.error('MyAnimeList Scraping Error:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'Gagal mengambil rekomendasi anime dari MyAnimeList' 
    });
  }
};

export const getUserRecommendations = async (req, res) => {
  try {
    const url = `https://myanimelist.net/recommendations.php?s=userrecs&t=anime`;
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': 'https://myanimelist.net/'
      }
    });
    const html = response.data;
    const $ = load(html);

    const users = [];
    
    $('a[href*="/profile/"]').each((index, element) => {
      try {
        const linkText = $(element).text().trim();
        const href = $(element).attr('href');
        
        if (href && href.startsWith('/profile/')) {
          const parentText = $(element).parent().text().trim();
          const match = parentText.match(/(.+?)\s+with\s+(\d+)\s+recommendation/i);
          
          if (match) {
            const username = match[1].trim();
            const count = parseInt(match[2]);
            
            if (!users.find(u => u.username === username)) {
              users.push({
                username,
                recommendationCount: count,
                profileUrl: `https://myanimelist.net${href}`,
                type: 'anime'
              });
            }
          }
        }
      } catch (err) {
        console.error('Error parsing user recommendation:', err.message);
      }
    });

    users.sort((a, b) => b.recommendationCount - a.recommendationCount);

    res.json({
      success: true,
      count: users.length,
      data: users,
      pagination: {
        currentPage: 1,
        hasNextPage: false
      }
    });
  } catch (error) {
    console.error('MyAnimeList User Recommendations Scraping Error:', error.message);
    console.error('Error details:', error.response?.status, error.response?.statusText);
    res.status(500).json({ 
      success: false,
      error: 'Gagal mengambil user recommendations dari MyAnimeList',
      details: error.message
    });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;
    
    if (!username) {
      return res.status(400).json({
        success: false,
        error: 'Username diperlukan'
      });
    }
    
    const url = `https://myanimelist.net/profile/${username}`;
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      }
    });
    const html = response.data;
    const $ = load(html);

    const profile = {};
    
    profile.username = username;
    profile.avatar = $('.user-image img').attr('data-src') || $('.user-image img').attr('src');
    
    $('ul.user-status li').each((i, el) => {
      const text = $(el).text().trim();
      if (text.startsWith('Last Online')) {
        profile.lastOnline = text.replace('Last Online', '').trim();
      } else if (text.startsWith('Gender')) {
        profile.gender = text.replace('Gender', '').trim();
      } else if (text.startsWith('Birthday')) {
        profile.birthday = text.replace('Birthday', '').trim();
      } else if (text.startsWith('Location')) {
        profile.location = text.replace('Location', '').trim();
      } else if (text.startsWith('Joined')) {
        profile.joined = text.replace('Joined', '').trim();
      }
    });
    
    const extractNumber = (text) => {
      const match = text.match(/[\d,]+/);
      return match ? match[0] : '0';
    };
    
    const statsLinks = $('ul.user-status.border-top li a');
    statsLinks.each((i, el) => {
      const text = $(el).text();
      if (text.includes('Forum Posts')) {
        profile.forumPosts = extractNumber(text);
      } else if (text.includes('Reviews')) {
        profile.reviews = extractNumber(text);
      } else if (text.includes('Recommendations')) {
        profile.recommendations = extractNumber(text);
      } else if (text.includes('Interest Stacks')) {
        profile.interestStacks = extractNumber(text);
      } else if (text.includes('Blog Posts')) {
        profile.blogPosts = extractNumber(text);
      } else if (text.includes('Clubs')) {
        profile.clubs = extractNumber(text);
      }
    });
    
    const animeStats = {};
    
    try {
      const jikanStatsUrl = `https://api.jikan.moe/v4/users/${username}/statistics`;
      const jikanStatsResponse = await axios.get(jikanStatsUrl);
      
      if (jikanStatsResponse.data && jikanStatsResponse.data.data && jikanStatsResponse.data.data.anime) {
        const animeData = jikanStatsResponse.data.data.anime;
        animeStats.days = animeData.days_watched?.toString() || '0';
        animeStats.meanScore = animeData.mean_score?.toString() || '0';
        animeStats.watching = animeData.watching?.toString() || '0';
        animeStats.completed = animeData.completed?.toString() || '0';
        animeStats.onHold = animeData.on_hold?.toString() || '0';
        animeStats.dropped = animeData.dropped?.toString() || '0';
        animeStats.planToWatch = animeData.plan_to_watch?.toString() || '0';
        animeStats.totalEntries = animeData.total_entries?.toString() || '0';
        animeStats.rewatched = animeData.rewatched?.toString() || '0';
        animeStats.episodes = animeData.episodes_watched?.toString() || '0';
      }
    } catch (statsError) {
      console.log('Could not fetch anime stats from Jikan API:', statsError.message);
    }
    
    profile.animeStats = animeStats;
    
    const favorites = {
      anime: [],
      characters: [],
      people: [],
      manga: []
    };
    
    $('ul.favorites-list').each((i, el) => {
      const heading = $(el).prev('h5').text().toLowerCase();
      
      $(el).find('li').each((j, item) => {
        const link = $(item).find('a');
        const name = link.text().trim();
        const url = link.attr('href');
        const img = $(item).find('img, .image');
        const image = img.attr('data-src') || img.attr('src') || img.css('background-image')?.replace(/url\(['"]?(.*?)['"]?\)/i, '$1');
        
        if (name) {
          const favItem = { name, url: url ? `https://myanimelist.net${url}` : null, image };
          
          if (heading.includes('anime')) {
            favorites.anime.push(favItem);
          } else if (heading.includes('character')) {
            favorites.characters.push(favItem);
          } else if (heading.includes('people')) {
            favorites.people.push(favItem);
          } else if (heading.includes('manga')) {
            favorites.manga.push(favItem);
          }
        }
      });
    });
    
    profile.favorites = favorites;
    
    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('MyAnimeList User Profile Scraping Error:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'Gagal mengambil profil user dari MyAnimeList' 
    });
  }
};

export const getUserProfileRecommendations = async (req, res) => {
  try {
    const { username } = req.params;
    const page = req.query.page || 1;
    
    if (!username) {
      return res.status(400).json({
        success: false,
        error: 'Username diperlukan'
      });
    }
    
    const url = `https://myanimelist.net/profile/${username}/recommendations?p=${page}`;
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      }
    });
    const html = response.data;
    const $ = load(html);

    const recommendations = [];
    
    $('p.profile-user-recs-text').each((index, element) => {
      try {
        const descPara = $(element);
        const description = descPara.text().trim();
        
        const table = descPara.prev('table');
        if (!table.length) return;
        
        const leftCell = table.find('td').eq(0);
        const rightCell = table.find('td').eq(1);
        
        const leftLink = leftCell.find('a[title]').first();
        const leftTitle = leftLink.find('strong').text().trim() || leftLink.text().trim();
        const leftUrl = leftLink.attr('href');
        const leftImg = leftCell.find('img[data-src], .picSurround img, img').first();
        const leftImage = leftImg.attr('data-src') || leftImg.attr('src') || '';
        
        const rightLink = rightCell.find('a[title]').first();
        const rightTitle = rightLink.find('strong').text().trim() || rightLink.text().trim();
        const rightUrl = rightLink.attr('href');
        const rightImg = rightCell.find('img[data-src], .picSurround img, img').first();
        const rightImage = rightImg.attr('data-src') || rightImg.attr('src') || '';
        
        const lightLink = descPara.next('.lightLink');
        const metadata = lightLink.text().trim();
        const dateMatch = metadata.match(/([A-Z][a-z]{2}\s+\d{1,2},?\s+\d{4})/);
        const date = dateMatch ? dateMatch[1] : '';
        
        const typeMatch = leftUrl ? (leftUrl.includes('/anime/') ? 'anime' : 'manga') : '';
        
        if (leftTitle && rightTitle && description && description.length > 5) {
          recommendations.push({
            type: typeMatch,
            left: {
              title: leftTitle,
              url: leftUrl || '',
              image: leftImage
            },
            right: {
              title: rightTitle,
              url: rightUrl || '',
              image: rightImage
            },
            description,
            date
          });
        }
      } catch (err) {
        console.error('Error parsing recommendation:', err.message);
      }
    });
    
    const totalText = $('.normal_header h2').text();
    const totalMatch = totalText.match(/Total\s+Recommendations:\s+([\d,]+)/);
    const total = totalMatch ? totalMatch[1] : '0';
    
    const hasNext = $('a:contains("More Recommendations")').length > 0;
    const hasPrev = $('a:contains("Previous")').length > 0;
    
    res.json({
      success: true,
      username,
      total,
      page: parseInt(page),
      count: recommendations.length,
      data: recommendations,
      pagination: {
        hasNextPage: hasNext,
        hasPreviousPage: hasPrev
      }
    });
  } catch (error) {
    console.error('MyAnimeList User Recommendations Scraping Error:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'Gagal mengambil user recommendations dari MyAnimeList',
      details: error.message
    });
  }
};

export const getGenres = async (req, res) => {
  try {
    const now = Date.now();
    
    if (genresCache && genresCacheTimestamp && (now - genresCacheTimestamp < GENRES_CACHE_DURATION)) {
      return res.json({
        success: true,
        data: genresCache,
        cached: true
      });
    }
    
    await delayIfNeeded();
    
    const response = await axios.get(`${JIKAN_BASE}/genres/anime`);
    const genres = response.data.data || [];
    
    const formattedGenres = genres.map(genre => ({
      mal_id: genre.mal_id,
      name: genre.name,
      count: genre.count,
      url: genre.url
    }));
    
    genresCache = formattedGenres;
    genresCacheTimestamp = now;
    
    res.json({
      success: true,
      data: formattedGenres
    });
  } catch (error) {
    console.error('Jikan Genres Error:', error.message);
    
    if (error.response?.status === 429) {
      return res.status(429).json({ 
        success: false,
        error: 'Terlalu banyak request. Silakan tunggu sebentar dan coba lagi.',
        details: 'Rate limit exceeded'
      });
    }
    
    res.status(500).json({ 
      success: false,
      error: 'Gagal mengambil daftar genre dari MyAnimeList',
      details: error.message
    });
  }
};

export const getMALAnimeByType = async (req, res) => {
  try {
    const { type, page = 1 } = req.query;
    
    await delayIfNeeded();
    
    const params = {
      type: type?.toLowerCase() || 'tv',
      page: parseInt(page),
      limit: 25,
      order_by: 'members',
      sort: 'desc'
    };
    
    let retries = 3;
    let response;
    
    while (retries > 0) {
      try {
        response = await axios.get(`${JIKAN_BASE}/anime`, { 
          params,
          timeout: 10000
        });
        break;
      } catch (error) {
        retries--;
        if (error.response?.status === 429 && retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        }
        throw error;
      }
    }
    
    const animeList = response.data.data.map(anime => ({
      mal_id: anime.mal_id,
      title: anime.title,
      image: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
      type: anime.type,
      score: anime.score,
      episodes: anime.episodes,
      members: anime.members,
      synopsis: anime.synopsis || 'Sinopsis tidak tersedia.',
      aired: anime.aired,
      duration: anime.duration,
      genres: anime.genres || [],
      studios: anime.studios || [],
      source: anime.source || '',
      themes: anime.themes || [],
      demographics: anime.demographics || [],
      status: anime.status
    }));
    
    const pagination = response.data.pagination || {};
    
    res.json({
      data: animeList,
      pagination: {
        currentPage: pagination.current_page || parseInt(page),
        totalPages: pagination.last_visible_page || 1,
        totalItems: pagination.items?.total || animeList.length,
        itemsPerPage: pagination.items?.per_page || 25,
        hasNextPage: pagination.has_next_page || false,
        hasPrevPage: (parseInt(page) > 1)
      }
    });
  } catch (error) {
    console.error('Jikan Anime By Type Error:', error.message);
    
    if (error.response?.status === 429) {
      return res.status(429).json({ 
        success: false,
        error: 'Terlalu banyak request. Silakan tunggu sebentar.',
        details: 'Rate limit exceeded'
      });
    }
    
    res.status(500).json({ 
      success: false,
      error: 'Gagal mengambil anime berdasarkan type',
      details: error.message
    });
  }
};

export const getAnimeByGenre = async (req, res) => {
  try {
    const { genreId } = req.params;
    const { page = 1 } = req.query;
    
    const cacheKey = `${genreId}-${page}`;
    const now = Date.now();
    
    if (genreAnimeCache[cacheKey] && genreAnimeCacheTimestamp[cacheKey] && 
        (now - genreAnimeCacheTimestamp[cacheKey] < GENRE_ANIME_CACHE_DURATION)) {
      return res.json({
        ...genreAnimeCache[cacheKey],
        cached: true
      });
    }
    
    await delayIfNeeded();
    
    const params = {
      genres: genreId,
      page: parseInt(page),
      limit: 25,
      order_by: 'members',
      sort: 'desc'
    };
    
    const response = await axios.get(`${JIKAN_BASE}/anime`, { params });
    
    const animeList = response.data.data.map(anime => ({
      mal_id: anime.mal_id,
      title: anime.title,
      image: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
      synopsis: anime.synopsis || 'Sinopsis tidak tersedia',
      score: anime.score || 'N/A',
      type: anime.type,
      episodes: anime.episodes || '?',
      status: anime.status,
      aired: anime.aired?.string || 'TBA',
      members: anime.members,
      genres: anime.genres || [],
      studios: anime.studios || [],
      source: anime.source || '',
      themes: anime.themes || [],
      demographics: anime.demographics || []
    }));
    
    const pagination = response.data.pagination || {};
    
    const responseData = {
      success: true,
      data: animeList,
      pagination: {
        currentPage: pagination.current_page || parseInt(page),
        totalPages: pagination.last_visible_page || 1,
        totalItems: pagination.items?.total || animeList.length,
        itemsPerPage: pagination.items?.per_page || 25,
        hasNextPage: pagination.has_next_page || false,
        hasPrevPage: (parseInt(page) > 1)
      }
    };
    
    genreAnimeCache[cacheKey] = responseData;
    genreAnimeCacheTimestamp[cacheKey] = now;
    
    res.json(responseData);
  } catch (error) {
    console.error('Jikan Anime by Genre Error:', error.message);
    
    if (error.response?.status === 429) {
      return res.status(429).json({ 
        success: false,
        error: 'Terlalu banyak request. Silakan tunggu sebentar dan coba lagi.',
        details: 'Rate limit exceeded'
      });
    }
    
    res.status(500).json({ 
      success: false,
      error: 'Gagal mengambil anime berdasarkan genre',
      details: error.message
    });
  }
};
