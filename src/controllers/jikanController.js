import axios from 'axios';

const JIKAN_BASE = 'https://api.jikan.moe/v4';

export const getSchedule = async (req, res) => {
  try {
    const response = await axios.get(`${JIKAN_BASE}/schedules`);
    
    const scheduleByDay = {};
    const dayMapping = {
      'monday': 'Senin',
      'tuesday': 'Selasa',
      'wednesday': 'Rabu',
      'thursday': 'Kamis',
      'friday': 'Jumat',
      'saturday': 'Sabtu',
      'sunday': 'Minggu'
    };

    response.data.data.forEach(anime => {
      const day = anime.broadcast?.day || 'unknown';
      const indonesianDay = dayMapping[day.toLowerCase()] || 'Tidak Diketahui';
      
      if (!scheduleByDay[indonesianDay]) {
        scheduleByDay[indonesianDay] = [];
      }

      scheduleByDay[indonesianDay].push({
        title: anime.title,
        image: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
        day: indonesianDay,
        time: anime.broadcast?.time || 'TBA',
        episode: `Episodes: ${anime.episodes || '?'}`,
        score: anime.score,
        type: anime.type,
        status: anime.status
      });
    });

    const formattedData = [];
    Object.keys(scheduleByDay).forEach(day => {
      formattedData.push(...scheduleByDay[day]);
    });

    res.json(formattedData);
  } catch (error) {
    console.error('Jikan API Error:', error.message);
    res.status(500).json({ error: 'Gagal mengambil jadwal anime' });
  }
};

export const getCurrentSeason = async (req, res) => {
  try {
    const response = await axios.get(`${JIKAN_BASE}/seasons/now`, {
      params: { limit: 25 }
    });

    const data = response.data.data.map(anime => ({
      title: anime.title,
      image: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
      type: anime.type,
      score: anime.score,
      status: anime.status,
      episodes: anime.episodes,
      synopsis: anime.synopsis
    }));

    res.json(data);
  } catch (error) {
    console.error('Jikan API Error:', error.message);
    res.status(500).json({ error: 'Gagal mengambil anime terbaru' });
  }
};

export const getPopular = async (req, res) => {
  try {
    const response = await axios.get(`${JIKAN_BASE}/top/anime`, {
      params: { limit: 25 }
    });

    const data = response.data.data.map(anime => ({
      title: anime.title,
      image: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
      type: anime.type,
      score: anime.score,
      status: anime.status,
      rank: anime.rank
    }));

    res.json(data);
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
