import express from 'express';
import { parseJd, getResumeSuggestions, generateResume } from '../controllers/aiController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/parse-jd', protect, parseJd);
router.post('/resume-suggestions', protect, getResumeSuggestions);
router.post('/generate-resume', protect, generateResume);

export default router;
