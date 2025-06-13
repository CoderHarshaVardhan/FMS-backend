import express from "express";
import {
    getTimetable,
    deleteTimetableEntry,
    getTimeTableByFaculty,
    getTimeTableByClass,
    editTimeTable,
} from "../controllers/timetableController.js";
import { authenticate } from "../middleware/authMiddleware.js"

const router = express.Router();

router.get("/details", authenticate, getTimetable);
router.delete("details/:id", authenticate, deleteTimetableEntry);
router.get('/class/:classId', authenticate, getTimeTableByClass);
router.get('/faculty/:facultyId', authenticate, getTimeTableByFaculty);
router.put("/:id", editTimeTable);
router.delete('/:id',authenticate, deleteTimetableEntry);

export default router;
