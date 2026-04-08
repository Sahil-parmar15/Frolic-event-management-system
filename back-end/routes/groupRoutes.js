const express = require('express');
const router = express.Router();
const {
    getGroups,
    getGroup,
    getGroupsByEvent,
    createGroup,
    updateGroup,
    deleteGroup
} = require('../controllers/groupController');
const { protect } = require('../middleware/auth');

// Public routes (no authentication required)
router.post('/public/create', createGroup);

// Protected routes (authentication required)
router.use(protect);

router.route('/')
    .get(getGroups)
    .post(createGroup);

router.get('/event/:id', getGroupsByEvent);

router.route('/:id')
    .get(getGroup)
    .patch(updateGroup)
    .delete(deleteGroup);

module.exports = router;
