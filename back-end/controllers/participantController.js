const Participants = require('../models/Participant');
const Groups = require('../models/Group');
const Events = require('../models/Event');

exports.getParticipants = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const startIndex = (page - 1) * limit;

        let query = {};
        if (req.query.search) {
            query.$or = [
                { ParticipantName: { $regex: req.query.search, $options: 'i' } },
                { Email: { $regex: req.query.search, $options: 'i' } }
            ];
        }
        if (req.query.groupId) {
            query.GroupID = req.query.groupId;
        }
        if (req.query.eventId) {
            query.EventID = req.query.eventId;
        }

        const total = await Participants.countDocuments(query);
        const participants = await Participants.find(query)
            .populate('GroupID', 'GroupName EventID')
            .populate('EventID', 'EventName DepartmentID')
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
            count: participants.length,
            pagination,
            data: participants
        });
    } catch (error) {
        next(error);
    }
};

exports.getParticipant = async (req, res, next) => {
    try {
        const participant = await Participants.findById(req.params.id)
            .populate('GroupID', 'GroupName EventID')
            .populate('EventID', 'EventName DepartmentID MinParticipants MaxParticipants')
            .populate('ModifiedBy', 'name email');

        if (!participant) {
            return res.status(404).json({
                success: false,
                message: 'Participant not found'
            });
        }

        res.status(200).json({
            success: true,
            data: participant
        });
    } catch (error) {
        next(error);
    }
};

exports.createParticipant = async (req, res, next) => {
    try {
        const { ParticipantName, Email, Phone, GroupID, EventID } = req.body;

        if (!ParticipantName || !Email || !Phone || !GroupID || !EventID) {
            return res.status(400).json({
                success: false,
                message: 'Please provide ParticipantName, Email, Phone, GroupID, and EventID'
            });
        }

        const group = await Groups.findById(GroupID);
        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Group not found'
            });
        }

        const event = await Events.findById(EventID);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        if (group.EventID.toString() !== EventID) {
            return res.status(400).json({
                success: false,
                message: 'Group does not belong to the specified event'
            });
        }

        const existingParticipant = await Participants.findOne({
            Email: req.body.Email,
            EventID: req.body.EventID
        });

        if (existingParticipant) {
            return res.status(400).json({
                success: false,
                message: 'Participant with this email already exists in this event'
            });
        }

        const groupParticipants = await Participants.countDocuments({ GroupID });
        if (event.MaxParticipants && groupParticipants >= event.MaxParticipants) {
            return res.status(400).json({
                success: false,
                message: `Group has reached maximum participants limit (${event.MaxParticipants})`
            });
        }

        req.body.ModifiedBy = req.user._id;
        const participant = await Participants.create(req.body);

        const populatedParticipant = await Participants.findById(participant._id)
            .populate('GroupID', 'GroupName EventID')
            .populate('EventID', 'EventName DepartmentID')
            .populate('ModifiedBy', 'name email');

        res.status(201).json({
            success: true,
            data: populatedParticipant,
            message: 'Participant created successfully'
        });
    } catch (error) {
        next(error);
    }
};

exports.updateParticipant = async (req, res, next) => {
    try {
        let participant = await Participants.findById(req.params.id);

        if (!participant) {
            return res.status(404).json({
                success: false,
                message: 'Participant not found'
            });
        }

        if (req.body.Email && req.body.Email !== participant.Email) {
            const existingParticipant = await Participants.findOne({
                Email: req.body.Email,
                EventID: participant.EventID,
                _id: { $ne: req.params.id }
            });

            if (existingParticipant) {
                return res.status(400).json({
                    success: false,
                    message: 'Participant with this email already exists in this event'
                });
            }
        }

        if (req.body.GroupID && req.body.GroupID !== participant.GroupID.toString()) {
            const newGroup = await Groups.findById(req.body.GroupID);
            if (!newGroup) {
                return res.status(404).json({
                    success: false,
                    message: 'Group not found'
                });
            }

            if (newGroup.EventID.toString() !== participant.EventID.toString()) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot move participant to a group from a different event'
                });
            }

            const event = await Events.findById(participant.EventID);
            const newGroupParticipants = await Participants.countDocuments({ 
                GroupID: req.body.GroupID 
            });
            
            if (event.MaxParticipants && newGroupParticipants >= event.MaxParticipants) {
                return res.status(400).json({
                    success: false,
                    message: `Target group has reached maximum participants limit (${event.MaxParticipants})`
                });
            }
        }

        req.body.ModifiedBy = req.user._id;
        participant = await Participants.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        })
            .populate('GroupID', 'GroupName EventID')
            .populate('EventID', 'EventName DepartmentID')
            .populate('ModifiedBy', 'name email');

        res.status(200).json({
            success: true,
            data: participant,
            message: 'Participant updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteParticipant = async (req, res, next) => {
    try {
        const participant = await Participants.findById(req.params.id)
            .populate('GroupID', 'GroupName EventID')
            .populate('EventID', 'EventName DepartmentID MinParticipants');

        if (!participant) {
            return res.status(404).json({
                success: false,
                message: 'Participant not found'
            });
        }

        const event = await Events.findById(participant.EventID);
        const groupParticipants = await Participants.countDocuments({ 
            GroupID: participant.GroupID 
        });

        if (event.MinParticipants && groupParticipants <= event.MinParticipants) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete participant. Group must have at least ${event.MinParticipants} participants`
            });
        }

        const participantData = participant.toObject();
        await Participants.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            data: participantData,
            message: 'Participant deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

exports.getParticipantsByGroup = async (req, res, next) => {
    try {
        const participants = await Participants.find({ GroupID: req.params.id })
            .populate('GroupID', 'GroupName EventID')
            .populate('EventID', 'EventName DepartmentID')
            .populate('ModifiedBy', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: participants.length,
            data: participants
        });
    } catch (error) {
        next(error);
    }
};

exports.getParticipantsByEvent = async (req, res, next) => {
    try {
        const participants = await Participants.find({ EventID: req.params.id })
            .populate('GroupID', 'GroupName EventID')
            .populate('EventID', 'EventName DepartmentID')
            .populate('ModifiedBy', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: participants.length,
            data: participants
        });
    } catch (error) {
        next(error);
    }
};
