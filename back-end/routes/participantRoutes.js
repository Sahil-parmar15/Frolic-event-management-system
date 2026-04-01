const express = require('express');
const router = express.Router();
const {
    getParticipants,
    getParticipant,
    getParticipantsByGroup,
    getParticipantsByEvent,
    createParticipant,
    updateParticipant,
    deleteParticipant
} = require('../controllers/participantController');
const { protect } = require('../middleware/auth');

router.route('/')
    .get(getParticipants);

router.get('/group/:id', getParticipantsByGroup);
router.get('/event/:id', getParticipantsByEvent);

router.route('/:id')
    .get(getParticipant);

router.use(protect);

router.route('/')
    .post(createParticipant);

router.route('/:id')
    .patch(updateParticipant)
    .delete(deleteParticipant);

module.exports = router;
