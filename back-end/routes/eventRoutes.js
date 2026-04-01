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

router.route('/')
    .get(getEvents);

router.get('/department/:id/events', getEventsByDepartment);

router.route('/:id')
    .get(getEvent);

router.use(protect);

router.route('/')
    .post(authorize(), createEvent);

router.route('/:id')
    .patch(authorize(), updateEvent)
    .delete(authorize(), deleteEvent);

module.exports = router;
