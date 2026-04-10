import express from 'express';
import { getApplications, createApplication, updateApplication, deleteApplication } from '../controllers/applicationController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.route('/')
  .get(protect, getApplications)
  .post(protect, createApplication);

router.route('/:id')
  .put(protect, updateApplication)
  .delete(protect, deleteApplication);

export default router;
