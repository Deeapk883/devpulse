import express from 'express';
import authMiddleware from '../middleware/auth.js';
import { generateSummary, getSummaries } from '../controllers/summaryController.js';

const router = express.Router();

router.post('/generate/:repoId', authMiddleware, generateSummary);
router.get('/:repoId', authMiddleware, getSummaries);

export default router;