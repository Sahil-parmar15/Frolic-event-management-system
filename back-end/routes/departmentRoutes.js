const express = require('express');
const router = express.Router();
const {
    getDepartments,
    getDepartment,
    getDepartmentsByInstitute,
    createDepartment,
    updateDepartment,
    deleteDepartment
} = require('../controllers/departmentController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
    .get(getDepartments);

router.get('/institute/:id', getDepartmentsByInstitute);

router.route('/:id')
    .get(getDepartment);

router.use(protect);

router.route('/')
    .post(authorize(), createDepartment);

router.route('/:id')
    .patch(authorize(), updateDepartment)
    .delete(authorize(), deleteDepartment);

module.exports = router;
