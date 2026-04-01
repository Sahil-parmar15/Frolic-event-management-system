const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Users = require('../models/User');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'your-secret-key-change-in-production', {
        expiresIn: process.env.JWT_EXPIRE || '30d'
    });
};

exports.register = async (req, res, next) => {
    try {
        const { UserName, EmailAddress, PhoneNumber, UserPassword, IsAdmin } = req.body;

        if (!UserName || !EmailAddress || !PhoneNumber || !UserPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        const existingUser = await Users.findOne({ EmailAddress });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(UserPassword, salt);

        const user = await Users.create({
            UserName,
            EmailAddress,
            PhoneNumber,
            UserPassword: hashedPassword,
            IsAdmin: IsAdmin || false
        });

        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            data: {
                user: {
                    _id: user._id,
                    UserName: user.UserName,
                    EmailAddress: user.EmailAddress,
                    PhoneNumber: user.PhoneNumber,
                    IsAdmin: user.IsAdmin
                },
                token
            },
            message: 'User registered successfully'
        });
    } catch (error) {
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { EmailAddress, UserPassword } = req.body;

        if (!EmailAddress || !UserPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        const user = await Users.findOne({ EmailAddress }).select('+UserPassword');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const isMatch = await bcrypt.compare(UserPassword, user.UserPassword);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            data: {
                user: {
                    _id: user._id,
                    UserName: user.UserName,
                    EmailAddress: user.EmailAddress,
                    PhoneNumber: user.PhoneNumber,
                    IsAdmin: user.IsAdmin
                },
                token
            },
            message: 'Login successful'
        });
    } catch (error) {
        next(error);
    }
};

exports.getMe = async (req, res, next) => {
    try {
        const user = await Users.findById(req.user._id);

        res.status(200).json({
            success: true,
            data: {
                user: {
                    _id: user._id,
                    UserName: user.UserName,
                    EmailAddress: user.EmailAddress,
                    PhoneNumber: user.PhoneNumber,
                    IsAdmin: user.IsAdmin,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                }
            }
        });
    } catch (error) {
        next(error);
    }
};
