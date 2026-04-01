const Events = require('../models/Event');
const Departments = require('../models/Department');
const Groups = require('../models/Group');

exports.getEvents = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const startIndex = (page - 1) * limit;

        let query = {};
        if (req.query.search) {
            query.EventName = { $regex: req.query.search, $options: 'i' };
        }
        if (req.query.departmentId) {
            query.DepartmentID = req.query.departmentId;
        }
        if (req.query.status) {
            query.Status = req.query.status;
        }

        const total = await Events.countDocuments(query);
        const events = await Events.find(query)
            .populate('DepartmentID', 'DepartmentName InstituteID')
            .populate('EventCoOrdinatorID', 'name email phone')
            .populate('ModifiedBy', 'name email')
            .limit(limit)
            .skip(startIndex)
            .sort({ createdAt: -1 });

        const pagination = {};
        const endIndex = page * limit;
        if (endIndex < total) {
            pagination.next = { page: page + 1, limit };
        }
        if (startIndex > 0) {
            pagination.prev = { page: page - 1, limit };
        }

        res.status(200).json({
            success: true,
            count: events.length,
            pagination,
            data: events
        });
    } catch (error) {
        next(error);
    }
};

exports.getEvent = async (req, res, next) => {
    try {
        const event = await Events.findById(req.params.id)
            .populate('DepartmentID', 'DepartmentName InstituteID')
            .populate('EventCoOrdinatorID', 'name email phone')
            .populate('ModifiedBy', 'name email');

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        res.status(200).json({
            success: true,
            data: event
        });
    } catch (error) {
        next(error);
    }
};

exports.createEvent = async (req, res, next) => {
    try {
        const { EventName, DepartmentID, EventDate, EventTime, MinParticipants, MaxParticipants } = req.body;

        if (!EventName || !DepartmentID || !EventDate || !EventTime) {
            return res.status(400).json({
                success: false,
                message: 'Please provide EventName, DepartmentID, EventDate, and EventTime'
            });
        }

        if (MinParticipants && MaxParticipants && MinParticipants > MaxParticipants) {
            return res.status(400).json({
                success: false,
                message: 'MinParticipants cannot be greater than MaxParticipants'
            });
        }

        const department = await Departments.findById(DepartmentID);
        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        const existingEvent = await Events.findOne({
            EventName: req.body.EventName,
            DepartmentID: req.body.DepartmentID
        });

        if (existingEvent) {
            return res.status(400).json({
                success: false,
                message: 'Event with this name already exists in this department'
            });
        }

        req.body.ModifiedBy = req.user._id;
        const event = await Events.create(req.body);

        const populatedEvent = await Events.findById(event._id)
            .populate('DepartmentID', 'DepartmentName InstituteID')
            .populate('EventCoOrdinatorID', 'name email phone')
            .populate('ModifiedBy', 'name email');

        res.status(201).json({
            success: true,
            data: populatedEvent,
            message: 'Event created successfully'
        });
    } catch (error) {
        next(error);
    }
};

exports.updateEvent = async (req, res, next) => {
    try {
        let event = await Events.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        if (req.body.MinParticipants !== undefined && req.body.MaxParticipants !== undefined) {
            if (req.body.MinParticipants > req.body.MaxParticipants) {
                return res.status(400).json({
                    success: false,
                    message: 'MinParticipants cannot be greater than MaxParticipants'
                });
            }
        } else if (req.body.MinParticipants !== undefined) {
            if (req.body.MinParticipants > (event.MaxParticipants || req.body.MaxParticipants || 0)) {
                return res.status(400).json({
                    success: false,
                    message: 'MinParticipants cannot be greater than MaxParticipants'
                });
            }
        } else if (req.body.MaxParticipants !== undefined) {
            if ((event.MinParticipants || req.body.MinParticipants || 0) > req.body.MaxParticipants) {
                return res.status(400).json({
                    success: false,
                    message: 'MinParticipants cannot be greater than MaxParticipants'
                });
            }
        }

        if (req.body.EventName && req.body.EventName !== event.EventName) {
            const existingEvent = await Events.findOne({
                EventName: req.body.EventName,
                DepartmentID: event.DepartmentID,
                _id: { $ne: req.params.id }
            });

            if (existingEvent) {
                return res.status(400).json({
                    success: false,
                    message: 'Event with this name already exists in this department'
                });
            }
        }

        req.body.ModifiedBy = req.user._id;
        event = await Events.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        })
            .populate('DepartmentID', 'DepartmentName InstituteID')
            .populate('EventCoOrdinatorID', 'name email phone')
            .populate('ModifiedBy', 'name email');

        res.status(200).json({
            success: true,
            data: event,
            message: 'Event updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteEvent = async (req, res, next) => {
    try {
        const event = await Events.findById(req.params.id)
            .populate('DepartmentID', 'DepartmentName InstituteID')
            .populate('EventCoOrdinatorID', 'name email phone');

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        const groupsCount = await Groups.countDocuments({ EventID: req.params.id });
        if (groupsCount > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete event with existing groups'
            });
        }

        const eventData = event.toObject();
        await Events.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            data: eventData,
            message: 'Event deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

exports.getEventsByDepartment = async (req, res, next) => {
    try {
        const events = await Events.find({ DepartmentID: req.params.id })
            .populate('DepartmentID', 'DepartmentName InstituteID')
            .populate('EventCoOrdinatorID', 'name email phone')
            .populate('ModifiedBy', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: events.length,
            data: events
        });
    } catch (error) {
        next(error);
    }
};
