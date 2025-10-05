import express from 'express';
import { 
  getSchedule, 
  getCurrentSeason,
  getSeasonalAnime, 
  getPopular,
  getCurrentlyAiring,
  searchAnime, 
  getAnimeDetail,
  getCharacters,
  getEpisodes,
  getVideos,
  getStats,
  getReviews,
  getRecommendations,
  getPictures,
  getAnimeRecommendations,
  getUserRecommendations,
  getUserProfile,
  getUserProfileRecommendations,
  getTypeStatistics,
  getGenres,
  getAnimeByGenre
} from '../controllers/jikanController.js';

const router = express.Router();

router.get('/schedule', getSchedule);
router.get('/type-statistics', getTypeStatistics);
router.get('/airing', getCurrentlyAiring);
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
router.get('/mal-recommendations', getAnimeRecommendations);
router.get('/user-recommendations', getUserRecommendations);
router.get('/user-profile/:username', getUserProfile);
router.get('/user-profile/:username/recommendations', getUserProfileRecommendations);
router.get('/mal-genres', getGenres);
router.get('/mal-genres/:genreId', getAnimeByGenre);

export default router;
