const express = require('express');
const router = express.Router();
const {
    getWinners,
    getWinner,
    getWinnersByEvent,
    getWinnersByGroup,
    createWinner,
    updateWinner,
    deleteWinner
} = require('../controllers/winnerController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
    .get(getWinners);

router.get('/event/:id', getWinnersByEvent);
router.get('/group/:id', getWinnersByGroup);

router.route('/:id')
    .get(getWinner);

router.use(protect);

router.route('/')
    .post(authorize(), createWinner);

router.route('/:id')
    .patch(authorize(), updateWinner)
    .delete(authorize(), deleteWinner);

module.exports = router;
