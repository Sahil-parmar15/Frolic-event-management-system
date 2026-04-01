const jwt = require('jsonwebtoken');
const Users = require('../models/User');

exports.protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
        
        req.user = await Users.findById(decoded.id).select('-UserPassword');
        
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route'
        });
    }
};

exports.authorize = () => {
    return (req, res, next) => {
        if (req.user.IsAdmin) {
            return next();
        }

        if ( !req.user.IsAdmin) {
            return res.status(403).json({
                success: false,
                message: `User role is not authorized to access this route`
            });
        }

        next();
    };
};

exports.isAdmin = (req, res, next) => {
    if (!req.user.IsAdmin) {
        return res.status(403).json({
            success: false,
            message: 'Admin access required'
        });
    }
    next();
};

exports.isOwnerOrAdmin = (req, res, next) => {
    if (req.user.IsAdmin || req.user._id.toString() === req.params.id) {
        return next();
    }
    return res.status(403).json({
        success: false,
        message: 'Not authorized to access this resource'
    });
};
