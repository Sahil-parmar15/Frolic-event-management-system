const express = require('express');
const router = express.Router();
const {
    getUsers,
    getUser,
    updateUser,
    deleteUser
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
    .get(authorize(), getUsers);

router.route('/:id')
    .get(getUser)
    .patch(updateUser)
    .delete(authorize(), deleteUser);

module.exports = router;
