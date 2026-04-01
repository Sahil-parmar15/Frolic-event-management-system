const Institutes = require('../models/Institute');
const Departments = require('../models/Department');
const API_BASE_URL = ""

exports.getInstitutes = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 5;
        const skip = (page - 1) * limit;

        let query = {};
        if (req.query.search) {
            query.InstituteName = { $regex: req.query.search, $options: 'i' };
        }

        const total = await Institutes.countDocuments(query);
        const institutes = await Institutes.find(query)
            .populate('InsituteCoOrdinatorID', 'UserName EmailAddress PhoneNumber')
            .populate('ModifiedBy', 'UserName EmailAddress')
            .limit(limit)
            .skip(skip)
            .sort({ createdAt: -1 });

        const totalPages = Math.ceil(total / limit);

        res.status(200).json({
            success: true,
            count: institutes.length,
            pagination: {
                total,
                page,
                pages: totalPages,
                next: page < totalPages ? page + 1 : null,
                prev: page > 1 ? page - 1 : null
            },
            data: institutes
        });
    } catch (error) {
        next(error);
    }
};

exports.getInstitute = async (req, res, next) => {
    try {
        const institute = await Institutes.findById(req.params.id)
            .populate('InsituteCoOrdinatorID', 'UserName EmailAddress PhoneNumber')
            .populate('ModifiedBy', 'UserName EmailAddress');

        if (!institute) {
            return res.status(404).json({
                success: false,
                message: 'Institute not found'
            });
        }

        res.status(200).json({
            success: true,
            data: institute
        });
    } catch (error) {
        next(error);
    }
};

exports.createInstitute = async (req, res, next) => {
    try {
        req.body.ModifiedBy = req.user._id;

        if (req.file) {
            req.body.InsituteImage = req.file.path; 
        }

        const institute = await Institutes.create(req.body);

        const populatedInstitute = await Institutes.findById(institute._id)
            .populate('InsituteCoOrdinatorID', 'UserName EmailAddress')
            .populate('ModifiedBy', 'UserName EmailAddress');

        res.status(201).json({
            success: true,
            data: populatedInstitute,
            message: 'Institute created with image!'
        });
    } catch (error) {
        next(error);
    }
};

exports.updateInstitute = async (req, res, next) => {
    try {

        let institute = await Institutes.findById(req.params.id);

        if (!institute) {
            return res.status(404).json({
                success: false,
                message: 'Institute not found'
            });
        }

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated"
            });
        }

        if (req.file) {
            req.body.InsituteImage = `uploads/${req.file.filename}`;
        }

        req.body.ModifiedBy = req.user._id;
        institute = await Institutes.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        })
            .populate('InsituteCoOrdinatorID', 'UserName EmailAddress PhoneNumber')
            .populate('ModifiedBy', 'UserName EmailAddress');

        res.status(200).json({
            success: true,
            data: institute,
            message: 'Institute updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteInstitute = async (req, res, next) => {
    try {
        const institute = await Institutes.findById(req.params.id)
            .populate('InsituteCoOrdinatorID', 'UserName EmailAddress PhoneNumber');

        if (!institute) {
            return res.status(404).json({
                success: false,
                message: 'Institute not found'
            });
        }

        const departmentsCount = await Departments.countDocuments({ InstituteID: req.params.id });
        if (departmentsCount > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete institute with existing departments'
            });
        }

        const instituteData = institute.toObject();
        await Institutes.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            data: instituteData,
            message: 'Institute deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};
