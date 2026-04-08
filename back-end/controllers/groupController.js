const Groups = require('../models/Group');
const Events = require('../models/Event');
const Participants = require('../models/Participant');

exports.getGroups = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const startIndex = (page - 1) * limit;

        let query = {};
        if (req.query.search) {
            query.GroupName = { $regex: req.query.search, $options: 'i' };
        }
        if (req.query.eventId) {
            query.EventID = req.query.eventId;
        }

        const total = await Groups.countDocuments(query);
        const groups = await Groups.find(query)
            .populate('EventID', 'EventName DepartmentID EventDate EventTime')
            .populate('ModifiedBy', 'UserName EmailAddress')
            .limit(limit)
            .skip(startIndex)
            .sort({ createdAt: -1 });

        const totalPages = Math.ceil(total / limit);
        const pagination = {};
        const endIndex = page * limit;
        if (endIndex < total) {
            pagination.next = { page: page + 1, limit };
        }
        if (startIndex > 0) {
            pagination.prev = { page: page - 1, limit };
        }
        pagination.pages = totalPages;
        pagination.page = page;

        res.status(200).json({
            success: true,
            count: groups.length,
            total,
            pagination,
            data: groups
        });
    } catch (error) {
        next(error);
    }
};

exports.getGroup = async (req, res, next) => {
    try {
        const group = await Groups.findById(req.params.id)
            .populate('EventID', 'EventName DepartmentID EventDate EventTime MinParticipants MaxParticipants')
            .populate('ModifiedBy', 'UserName EmailAddress');

        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Group not found'
            });
        }

        res.status(200).json({
            success: true,
            data: group
        });
    } catch (error) {
        next(error);
    }
};

exports.createGroup = async (req, res, next) => {
    try {
        const { GroupName, EventID } = req.body;

        if (!GroupName || !EventID) {
            return res.status(400).json({
                success: false,
                message: 'Please provide GroupName and EventID'
            });
        }

        const event = await Events.findById(EventID);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        const existingGroup = await Groups.findOne({
            GroupName: req.body.GroupName,
            EventID: req.body.EventID
        });

        if (existingGroup) {
            return res.status(400).json({
                success: false,
                message: 'Group with this name already exists in this event'
            });
        }

        // No authentication required for public registration
        
        const group = await Groups.create(req.body);

        const populatedGroup = await Groups.findById(group._id)
            .populate('EventID', 'EventName DepartmentID EventDate EventTime')
            .populate('ModifiedBy', 'UserName EmailAddress');

        res.status(201).json({
            success: true,
            data: populatedGroup,
            message: 'Group created successfully'
        });
    } catch (error) {
        next(error);
    }
};

exports.updateGroup = async (req, res, next) => {
    try {
        let group = await Groups.findById(req.params.id);

        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Group not found'
            });
        }

        // Removed GroupLeaderID check as it is not in the schema

        if (req.body.GroupName && req.body.GroupName !== group.GroupName) {
            const existingGroup = await Groups.findOne({
                GroupName: req.body.GroupName,
                EventID: group.EventID,
                _id: { $ne: req.params.id }
            });

            if (existingGroup) {
                return res.status(400).json({
                    success: false,
                    message: 'Group with this name already exists in this event'
                });
            }
        }

        if (req.body.Participants && req.body.Participants.length > 0) {
            const event = await Events.findById(group.EventID);
            if (event.MaxParticipants && req.body.Participants.length > event.MaxParticipants) {
                return res.status(400).json({
                    success: false,
                    message: `Group cannot have more than ${event.MaxParticipants} participants`
                });
            }
            if (event.MinParticipants && req.body.Participants.length < event.MinParticipants) {
                return res.status(400).json({
                    success: false,
                    message: `Group must have at least ${event.MinParticipants} participants`
                });
            }
        }

        req.body.ModifiedBy = req.user._id;
        group = await Groups.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        })
            .populate('EventID', 'EventName DepartmentID EventDate EventTime')
            .populate('ModifiedBy', 'UserName EmailAddress');

        res.status(200).json({
            success: true,
            data: group,
            message: 'Group updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteGroup = async (req, res, next) => {
    try {
        const group = await Groups.findById(req.params.id)
            .populate('EventID', 'EventName DepartmentID');

        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Group not found'
            });
        }

        // Removed GroupLeaderID check as it is not in the schema

        const participantsCount = await Participants.countDocuments({ GroupID: req.params.id });
        if (participantsCount > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete group with existing participants'
            });
        }

        const groupData = group.toObject();
        await Groups.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            data: groupData,
            message: 'Group deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

exports.getGroupsByEvent = async (req, res, next) => {
    try {
        const groups = await Groups.find({ EventID: req.params.id })
            .populate('EventID', 'EventName DepartmentID EventDate EventTime')
            .populate('ModifiedBy', 'UserName EmailAddress')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: groups.length,
            data: groups
        });
    } catch (error) {
        next(error);
    }
};
