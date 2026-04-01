const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    UserName: {
        type: String,
        required: [true, "Please provide a username"],
        maxlength: 100,
        trim: true
    },
    UserPassword: {
        type: String,
        required: [true, "Password is required"],
        maxlength: 300,
        select: false
    },
    EmailAddress: {
        type: String,
        required: [true, "Email address is required"],
        maxlength: 300,
        unique: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    PhoneNumber: {
        type: String,
        required: [true, "Phone number is required"],
        maxlength: 50
    },
    IsAdmin: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

UserSchema.index({ UserName: 1 });

module.exports = mongoose.model('Users', UserSchema);
