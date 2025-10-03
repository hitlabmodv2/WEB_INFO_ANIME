import axios from 'axios';

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
