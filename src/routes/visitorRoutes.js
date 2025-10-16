import express from 'express';
import { trackVisitor, getVisitorStats, heartbeat } from '../controllers/visitorController.js';

const router = express.Router();

router.post('/track', trackVisitor);
router.get('/stats', getVisitorStats);
router.post('/heartbeat', heartbeat);

export default router;
