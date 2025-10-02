import express from 'express';
import { getSchedule, getCurrentSeason, getPopular, searchAnime } from '../controllers/jikanController.js';

const router = express.Router();

router.get('/schedule', getSchedule);
router.get('/new', getCurrentSeason);
router.get('/popular', getPopular);
router.get('/search/:keyword', searchAnime);

export default router;
