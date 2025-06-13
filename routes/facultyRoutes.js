import express from 'express';
import { getFacultyPerformance } from '../controllers/facultyPerformanceController.js';
import { authenticate, roleCheck } from '../middleware/authMiddleware.js';
import { getOwnFeedback } from '../controllers/feedbackController.js';
import { applyLeave, getLeaveStatus } from '../controllers/leaveController.js';
import { getOwnTimetable } from '../controllers/timetableController.js';

const router = express.Router();

router.get('/performance', authenticate, roleCheck('faculty'), getFacultyPerformance);
router.get('/my-feedback', authenticate, roleCheck('faculty'), getOwnFeedback);
router.post('/apply-leave', authenticate, applyLeave);
router.get('/my-leaves', authenticate, getLeaveStatus);
router.get("/my-classes", authenticate, getOwnTimetable);

export default router;
