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

router.route('/')
    .get(getGroups);

router.get('/event/:id', getGroupsByEvent);

router.route('/:id')
    .get(getGroup);

router.use(protect);

router.route('/')
    .post(createGroup);

router.route('/:id')
    .patch(updateGroup)
    .delete(deleteGroup);

module.exports = router;
