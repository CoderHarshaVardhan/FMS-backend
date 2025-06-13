import express from 'express';
import { authenticate, roleCheck } from '../middleware/authMiddleware.js';
import { approveLeaveRequests, getClasses, getLeaveRequests } from '../controllers/adminController.js';
import {
    getAllFaculties,
    createFaculty,
    updateFaculty,
    deleteFaculty
} from '../controllers/facultyController.js';
import {
    getAllStudents,
    createStudent,
    updateStudent,
    deleteStudent
} from '../controllers/adminStudentController.js';
import { getAllFeedbacks } from '../controllers/adminFeedbackController.js';
import { createTimetableEntry } from '../controllers/timetableController.js';
import timetableRoutes from './timetableRoutes.js';
import { getFeedbackSummary } from '../controllers/adminController.js';



const router = express.Router();

router.get('/leave-requests', authenticate, roleCheck("admin"), getLeaveRequests);
router.put('/leave-requests/:id/status', authenticate, roleCheck("admin"), approveLeaveRequests);
router.get('/faculties', authenticate, roleCheck("admin"), getAllFaculties);
router.post('/faculties', authenticate, roleCheck("admin"), createFaculty);
router.put('/faculties/:id', authenticate, roleCheck("admin"), updateFaculty);
router.delete('/faculties/:id', authenticate, roleCheck("admin"), deleteFaculty);

router.get('/students', authenticate, roleCheck("admin"), getAllStudents);
router.post('/students', authenticate, roleCheck("admin"), createStudent);
router.put('/students/:id', authenticate, roleCheck("admin"), updateStudent);
router.delete('/students/:id', authenticate, roleCheck("admin"), deleteStudent);

// router.get('/feedbacks', authenticate, roleCheck('admin'), getAllFeedbacks);


router.post('/timetable', authenticate, roleCheck("admin"), createTimetableEntry);

router.use("/timetable", timetableRoutes);
router.get('/classes', authenticate, getClasses);

router.get('/feedbacks', authenticate, getFeedbackSummary);

export default router;