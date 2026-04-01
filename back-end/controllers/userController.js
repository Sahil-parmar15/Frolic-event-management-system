const Users = require('../models/User');
const bcrypt = require('bcryptjs');

exports.getUsers = async (req, res, next) => {
    try {
        const users = await Users.find().select('-UserPassword');

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        next(error);
    }
};

exports.getUser = async (req, res, next) => {
    try {
        const user = await Users.findById(req.params.id).select('-UserPassword');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (!req.user.IsAdmin && req.user._id.toString() !== req.params.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this resource'
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
};

exports.updateUser = async (req, res, next) => {
    try {
        let user = await Users.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (!req.user.IsAdmin && req.user._id.toString() !== req.params.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this resource'
            });
        }

        if (req.body.UserPassword) {
            const salt = await bcrypt.genSalt(10);
            req.body.UserPassword = await bcrypt.hash(req.body.UserPassword, salt);
        }

        if (req.body.IsAdmin !== undefined && !req.user.IsAdmin) {
            delete req.body.IsAdmin;
        }

        user = await Users.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        }).select('-UserPassword');

        res.status(200).json({
            success: true,
            data: user,
            message: 'User updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteUser = async (req, res, next) => {
    try {
        const user = await Users.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        await Users.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            data: {},
            message: 'User deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};
