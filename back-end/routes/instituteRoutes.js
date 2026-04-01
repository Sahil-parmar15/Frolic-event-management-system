const express = require('express');
const upload = require('../middleware/multer');
const router = express.Router();
const {
    getInstitutes,
    getInstitute,
    createInstitute,
    updateInstitute,
    deleteInstitute
} = require('../controllers/instituteController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
    .get(getInstitutes);

router.route('/:id')
    .get(getInstitute);

router.use(protect);
router.use(authorize());

router.route('/')
    .post(upload.single('InsituteImage'),createInstitute);

router.route('/:id')
    .patch(upload.single('InsituteImage'),updateInstitute)
    .delete(deleteInstitute);

module.exports = router;
