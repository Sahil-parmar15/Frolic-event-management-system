const mongoose = require('mongoose');

const ParticipantSchema = new mongoose.Schema({
    ParticipantName: {
        type: String,
        required: [true, "Participant name is required"],
        maxlength: 100,
        trim: true
    },
    ParticipantEnrollmentNumber: {
        type: String,
        required: [true, "Enrollment number is required"],
        maxlength: 100,
        trim: true
    },
    ParticipantInsituteName: {
        type: String,
        required: [true, "Institute name is required"],
        maxlength: 300,
        trim: true
    },
    ParticipantCIty: {
        type: String,
        maxlength: 300,
        default: null
    },
    ParticipantMobile: {
        type: String,
        required: [true, "Mobile number is required"],
        maxlength: 100
    },
    ParticipantEmail: {
        type: String,
        required: [true, "Email is required"],
        maxlength: 300,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    IsGroupLeader: {
        type: Boolean,
        default: false
    },
    GroupID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Groups',
        required: [true, "Group ID is required"]
    },
    ModifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        default: null
    }
}, {
    timestamps: true
});

ParticipantSchema.index({ GroupID: 1 });
ParticipantSchema.index({ ParticipantEnrollmentNumber: 1 });
ParticipantSchema.index({ ParticipantEmail: 1 });
ParticipantSchema.index({ IsGroupLeader: 1 });

module.exports = mongoose.model('Participants', ParticipantSchema);
