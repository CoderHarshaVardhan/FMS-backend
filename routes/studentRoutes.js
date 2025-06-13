// routes/studentRoutes.js
import express from 'express';
import { submitFeedback, getAllFaculties } from '../controllers/studentController.js';
import { authenticate, isStudent } from '../middleware/authMiddleware.js';

// POST /api/student/feedback

const router = express.Router();

router.post('/feedback', authenticate, isStudent, submitFeedback);

router.get('/faculties', authenticate, isStudent, getAllFaculties);


export default router;