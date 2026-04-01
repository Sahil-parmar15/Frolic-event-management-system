const mongoose = require('mongoose');

const DepartmentSchema = new mongoose.Schema({
    DepartmentName: {
        type: String,
        required: [true, "Department name is required"],
        maxlength: 100,
        trim: true
    },
    DepartmentImage: {
        type: String,
        maxlength: 300,
        default: null
    },
    DepartmentDescription: {
        type: String,
        maxlength: 1000,
        default: null
    },
    InstituteID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Institutes',
        required: [true, "Institute ID is required"]
    },
    DepartmentCoOrdinatorID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: [true, "Department coordinator is required"]
    },
    ModifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        default: null
    }
}, {
    timestamps: true
});

DepartmentSchema.index({ InstituteID: 1 });
DepartmentSchema.index({ DepartmentCoOrdinatorID: 1 });
DepartmentSchema.index({ DepartmentName: 1 });

module.exports = mongoose.model('Departments', DepartmentSchema);
