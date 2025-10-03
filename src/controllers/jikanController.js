import axios from 'axios';
import { load } from 'cheerio';
import { fetchPage } from '../utils/fetchPage.js';

const JIKAN_BASE = 'https://api.jikan.moe/v4';

export const getSchedule = async (req, res) => {
  try {
    const { type, page = 1 } = req.query;
    const params = { 
      page: parseInt(page),
      limit: 25
    };
    
    if (type && type !== 'all' && type !== '') {
      params.filter = type.toLowerCase();
    }
    
    const response = await axios.get(`${JIKAN_BASE}/seasons/now`, { params });
    
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
      'sundays': 'Minggu'
    };

    let formattedData = response.data.data.map(anime => {
      const day = anime.broadcast?.day || 'unknown';
      const indonesianDay = dayMapping[day.toLowerCase()] || 'Tidak Diketahui';
      
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

    const pagination = response.data.pagination || {};

    res.json({
      data: formattedData,
      pagination: {
        currentPage: pagination.current_page || parseInt(page),
        totalPages: pagination.last_visible_page || 1,
        totalItems: pagination.items?.total || formattedData.length,
        itemsPerPage: pagination.items?.per_page || 25,
        hasNextPage: pagination.has_next_page || false,
        hasPrevPage: (parseInt(page) > 1)
      }
    });
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
      params.filter = type.toLowerCase();
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

export const getSeasonalAnime = async (req, res) => {
  try {
    const { type, year, season, page = 1 } = req.query;
    const params = { 
      page: parseInt(page),
      limit: 25
    };
    
    if (type && type !== 'all' && type !== '') {
      params.filter = type.toLowerCase();
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
      params.filter = type.toLowerCase();
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
      params.type = type;
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
      synopsis: anime.synopsis
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
    profile.lastOnline = $('.user-status').first().text().trim();
    
    $('.user-profile-about .user-status-data .user-status-data-block').each((i, el) => {
      const text = $(el).text();
      if (text.includes('Gender:')) {
        profile.gender = text.replace('Gender:', '').trim();
      } else if (text.includes('Birthday:')) {
        profile.birthday = text.replace('Birthday:', '').trim();
      } else if (text.includes('Location:')) {
        profile.location = text.replace('Location:', '').trim();
      } else if (text.includes('Joined:')) {
        profile.joined = text.replace('Joined:', '').trim();
      }
    });
    
    const userStats = $('.user-statistics-stats');
    profile.forumPosts = userStats.find('div:contains("Forum Posts:")').text().replace('Forum Posts:', '').trim();
    profile.reviews = userStats.find('div:contains("Reviews:")').text().replace('Reviews:', '').trim();
    profile.recommendations = userStats.find('div:contains("Recommendations:")').text().replace('Recommendations:', '').trim();
    profile.blogPosts = userStats.find('div:contains("Blog Posts:")').text().replace('Blog Posts:', '').trim();
    profile.clubs = userStats.find('div:contains("Clubs:")').text().replace('Clubs:', '').trim();
    
    const animeStats = {};
    const animeStatsSection = $('.stats.anime');
    
    animeStatsSection.find('.stat-score .di-tc').each((i, el) => {
      const text = $(el).text().trim();
      if (text.includes('Days:')) {
        animeStats.days = text.replace('Days:', '').trim();
      } else if (text.includes('Mean Score:')) {
        animeStats.meanScore = text.replace('Mean Score:', '').trim();
      } else if (text.includes('Watching:')) {
        animeStats.watching = text.replace('Watching:', '').trim();
      } else if (text.includes('Completed:')) {
        animeStats.completed = text.replace('Completed:', '').trim();
      } else if (text.includes('On-Hold:')) {
        animeStats.onHold = text.replace('On-Hold:', '').trim();
      } else if (text.includes('Dropped:')) {
        animeStats.dropped = text.replace('Dropped:', '').trim();
      } else if (text.includes('Plan to Watch:')) {
        animeStats.planToWatch = text.replace('Plan to Watch:', '').trim();
      } else if (text.includes('Total Entries:')) {
        animeStats.totalEntries = text.replace('Total Entries:', '').trim();
      } else if (text.includes('Rewatched:')) {
        animeStats.rewatched = text.replace('Rewatched:', '').trim();
      } else if (text.includes('Episodes:')) {
        animeStats.episodes = text.replace('Episodes:', '').trim();
      }
    });
    
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
