const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
    EventName: {
        type: String,
        required: [true, "Event name is required"],
        maxlength: 100,
        trim: true
    },
    EventTagline: {
        type: String,
        maxlength: 300,
        default: null
    },
    EventImage: {
        type: String,
        maxlength: 300,
        default: null
    },
    EventDescription: {
        type: String,
        maxlength: 1000,
        default: null
    },
    GroupMinParticipants: {
        type: Number,
        required: [true, "Minimum participants is required"],
        min: 1
    },
    GroupMaxParticipants: {
        type: Number,
        required: [true, "Maximum participants is required"],
        min: 1,
        validate: {
            validator: function(value) {
                return value >= this.GroupMinParticipants;
            },
            message: 'Maximum participants must be greater than or equal to minimum participants'
        }
    },
    EventFees: {
        type: Number,
        required: [true, "Event fees is required"],
        min: 0
    },
    EventFirstPrice: {
        type: String,
        maxlength: 300,
        default: null
    },
    EventSecondPrice: {
        type: String,
        maxlength: 300,
        default: null
    },
    EventThirdPrice: {
        type: String,
        maxlength: 300,
        default: null
    },
    DepartmentID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Departments',
        required: [true, "Department ID is required"]
    },
    EventCoOrdinatorID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: [true, "Event coordinator is required"]
    },
    EventMainStudentCoOrdinatorName: {
        type: String,
        maxlength: 100,
        default: null
    },
    EventMainStudentCoOrdinatorPhone: {
        type: String,
        maxlength: 100,
        default: null
    },
    EventMainStudentCoOrdinatorEmail: {
        type: String,
        maxlength: 300,
        default: null,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    EventLocation: {
        type: String,
        maxlength: 100,
        default: null
    },
    MaxGroupsAllowed: {
        type: Number,
        required: [true, "Maximum groups allowed is required"],
        min: 1
    },
    ModifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        default: null
    }
}, {
    timestamps: true
});

EventSchema.index({ DepartmentID: 1 });
EventSchema.index({ EventCoOrdinatorID: 1 });
EventSchema.index({ EventName: 1 });

module.exports = mongoose.model('Events', EventSchema);
