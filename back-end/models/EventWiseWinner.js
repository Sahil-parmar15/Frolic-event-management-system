const mongoose = require('mongoose');

const EventWiseWinnerSchema = new mongoose.Schema({
    EventID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Events',
        required: [true, "Event ID is required"]
    },
    GroupID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Groups',
        required: [true, "Group ID is required"]
    },
    Sequence: {
        type: Number,
        required: [true, "Sequence is required"],
        min: 1,
        validate: {
            validator: function(value) {
                return true;
            }
        }
    },
    ModifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        default: null
    }
}, {
    timestamps: true
});

EventWiseWinnerSchema.index({ EventID: 1, GroupID: 1 }, { unique: true });
EventWiseWinnerSchema.index({ EventID: 1, Sequence: 1 }, { unique: true });
EventWiseWinnerSchema.index({ GroupID: 1 });

module.exports = mongoose.model('EventWiseWinners', EventWiseWinnerSchema);
