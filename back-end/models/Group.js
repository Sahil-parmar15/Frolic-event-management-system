const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
    GroupName: {
        type: String,
        required: [true, "Group name is required"],
        maxlength: 100,
        trim: true
    },
    EventID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Events',
        required: [true, "Event ID is required"]
    },
    IsPaymentDone: {
        type: Boolean,
        default: false
    },
    IsPresent: {
        type: Boolean,
        default: false
    },
    ModifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        default: null
    }
}, {
    timestamps: true
});

GroupSchema.index({ EventID: 1 });
GroupSchema.index({ GroupName: 1 });
GroupSchema.index({ IsPaymentDone: 1 });

module.exports = mongoose.model('Groups', GroupSchema);
