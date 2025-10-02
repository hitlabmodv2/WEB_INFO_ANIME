import express from 'express';
import { 
  getSchedule, 
  getCurrentSeason,
  getSeasonalAnime, 
  getPopular, 
  searchAnime, 
  getAnimeDetail,
  getCharacters,
  getEpisodes,
  getVideos,
  getStats,
  getReviews,
  getRecommendations,
  getPictures
} from '../controllers/jikanController.js';

const router = express.Router();

router.get('/schedule', getSchedule);
router.get('/new', getCurrentSeason);
router.get('/season', getSeasonalAnime);
router.get('/popular', getPopular);
router.get('/search/:keyword', searchAnime);
router.get('/detail/:id', getAnimeDetail);
router.get('/characters/:id', getCharacters);
router.get('/episodes/:id', getEpisodes);
router.get('/videos/:id', getVideos);
router.get('/stats/:id', getStats);
router.get('/reviews/:id', getReviews);
router.get('/recommendations/:id', getRecommendations);
router.get('/pictures/:id', getPictures);

export default router;
