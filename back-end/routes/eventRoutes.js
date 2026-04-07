const express = require('express');
const router = express.Router();
const {
    getEvents,
    getEvent,
    getEventsByDepartment,
    createEvent,
    updateEvent,
    deleteEvent
} = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/multer');

// Public routes (no authentication required)
router.route('/')
    .get(getEvents);

router.get('/department/:id/events', getEventsByDepartment);

router.route('/:id')
    .get(getEvent);

// Protected routes (authentication required)
router.use(protect);

router.route('/')
    .post(authorize(), upload.single('EventImage'), createEvent);

router.route('/:id')
    .patch(authorize(), upload.single('EventImage'), updateEvent)
    .delete(authorize(), deleteEvent);

module.exports = router;
