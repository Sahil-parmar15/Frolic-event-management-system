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

router.post('/public/create', createParticipant);

router.use(protect);

router.route('/')
    .get(getParticipants)
    .post(createParticipant);

router.get('/group/:id', getParticipantsByGroup);
router.get('/event/:id', getParticipantsByEvent);

router.route('/:id')
    .get(getParticipant)
    .patch(updateParticipant)
    .delete(deleteParticipant);

module.exports = router;
