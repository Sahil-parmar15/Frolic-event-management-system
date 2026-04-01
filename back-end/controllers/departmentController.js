const Departments = require('../models/Department');
const Institutes = require('../models/Institute');

exports.getDepartments = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const startIndex = (page - 1) * limit;

        let query = {};
        if (req.query.search) {
            query.DepartmentName = { $regex: req.query.search, $options: 'i' };
        }
        if (req.query.instituteId) {
            query.InstituteID = req.query.instituteId;
        }

        const total = await Departments.countDocuments(query);
        const departments = await Departments.find(query)
            .populate('InstituteID', 'InstituteName InsituteImage')
            .populate('DepartmentCoOrdinatorID', 'UserName EmailAddress PhoneNumber')
            .populate('ModifiedBy', 'UserName EmailAddress')
            .limit(limit)
            .skip(startIndex)
            .sort({ createdAt: -1 });

        const totalPages = Math.ceil(total / limit);
        const pagination = {
            total,
            page,
            pages: totalPages,
            next: page < totalPages ? page + 1 : null,
            prev: page > 1 ? page - 1 : null
        };

        res.status(200).json({
            success: true,
            count: departments.length,
            pagination,
            data: departments
        });
    } catch (error) {
        next(error);
    }
};

exports.getDepartmentsByInstitute = async (req, res, next) => {
    try {
        const departments = await Departments.find({ InstituteID: req.params.id })
            .populate('InstituteID', 'InstituteName InsituteImage')
            .populate('DepartmentCoOrdinatorID', 'UserName EmailAddress PhoneNumber')
            .populate('ModifiedBy', 'UserName EmailAddress')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: departments.length,
            data: departments
        });
    } catch (error) {
        next(error);
    }
};

exports.getDepartment = async (req, res, next) => {
    try {
        const department = await Departments.findById(req.params.id)
            .populate('InstituteID', 'InstituteName InsituteImage InsituteDescription')
            .populate('DepartmentCoOrdinatorID', 'UserName EmailAddress PhoneNumber')
            .populate('ModifiedBy', 'UserName EmailAddress');

        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        res.status(200).json({
            success: true,
            data: department
        });
    } catch (error) {
        next(error);
    }
};

exports.createDepartment = async (req, res, next) => {
    try {
        const institute = await Institutes.findById(req.body.InstituteID);
        if (!institute) {
            return res.status(404).json({
                success: false,
                message: 'Institute not found'
            });
        }

        const existingDept = await Departments.findOne({
            DepartmentName: req.body.DepartmentName,
            InstituteID: req.body.InstituteID
        });

        if (existingDept) {
            return res.status(400).json({
                success: false,
                message: 'Department with this name already exists in this institute'
            });
        }

        req.body.ModifiedBy = req.user._id;
        const department = await Departments.create(req.body);

        const populatedDepartment = await Departments.findById(department._id)
            .populate('InstituteID', 'InstituteName InsituteImage')
            .populate('DepartmentCoOrdinatorID', 'UserName EmailAddress PhoneNumber')
            .populate('ModifiedBy', 'UserName EmailAddress');

        res.status(201).json({
            success: true,
            data: populatedDepartment,
            message: 'Department created successfully'
        });
    } catch (error) {
        next(error);
    }
};

exports.updateDepartment = async (req, res, next) => {
    try {
        let department = await Departments.findById(req.params.id);

        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        if (req.body.DepartmentName && req.body.DepartmentName !== department.DepartmentName) {
            const existingDept = await Departments.findOne({
                DepartmentName: req.body.DepartmentName,
                InstituteID: department.InstituteID,
                _id: { $ne: req.params.id }
            });

            if (existingDept) {
                return res.status(400).json({
                    success: false,
                    message: 'Department with this name already exists in this institute'
                });
            }
        }

        req.body.ModifiedBy = req.user._id;
        department = await Departments.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        })
            .populate('InstituteID', 'InstituteName InsituteImage')
            .populate('DepartmentCoOrdinatorID', 'UserName EmailAddress PhoneNumber')
            .populate('ModifiedBy', 'UserName EmailAddress');

        res.status(200).json({
            success: true,
            data: department,
            message: 'Department updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteDepartment = async (req, res, next) => {
    try {
        const department = await Departments.findById(req.params.id)
            .populate('InstituteID', 'InstituteName InsituteImage')
            .populate('DepartmentCoOrdinatorID', 'UserName EmailAddress PhoneNumber')
            .populate('ModifiedBy', 'UserName EmailAddress');

        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        const Events = require('../models/Event');
        const eventsCount = await Events.countDocuments({ DepartmentID: req.params.id });
        if (eventsCount > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete department with existing events'
            });
        }

        const departmentData = department.toObject();
        await Departments.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            data: departmentData,
            message: 'Department deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};
