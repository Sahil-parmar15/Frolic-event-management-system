const mongoose = require('mongoose');

const InstituteSchema = new mongoose.Schema({
    InstituteName: {
        type: String,
        required: [true, "Institute name is required"],
        maxlength: 100,
        trim: true
    },
    InsituteImage: {
        type: String,
        default: null
    },
    InsituteDescription: {
        type: String,
        maxlength: 1000,
        default: null
    },
    InsituteCoOrdinatorID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: [true, "Institute coordinator is required"]
    },
    ModifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        default: null
    }
}, {
    timestamps: true
});

InstituteSchema.index({ InsituteCoOrdinatorID: 1 });
InstituteSchema.index({ InstituteName: 1 });

module.exports = mongoose.model('Institutes', InstituteSchema);
