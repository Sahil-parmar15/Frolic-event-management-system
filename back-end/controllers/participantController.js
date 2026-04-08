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
                { ParticipantEmail: { $regex: req.query.search, $options: 'i' } }
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
            count: participants.length,
            total,
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
            .populate('ModifiedBy', 'UserName EmailAddress');

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
        const {
            ParticipantName,
            ParticipantEmail,
            ParticipantContactNo,
            ParticipantEnrollmentNo,
            ParticipantInsituteName,
            ParticipantDepartmentName,
            ParticipantSemester,
            IsGroupLeader,
            GroupID,
            // Also accept already-mapped names from admin form
            ParticipantMobile,
            ParticipantEnrollmentNumber
        } = req.body;

        // Support both frontend field names (public form) and admin form names
        const mobile = ParticipantContactNo || ParticipantMobile;
        const enrollment = ParticipantEnrollmentNo || ParticipantEnrollmentNumber;

        if (!ParticipantName || !ParticipantEmail || !mobile || !enrollment || !ParticipantInsituteName || !GroupID) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required participant details (Name, Email, Contact, Enrollment, Institute, Group)'
            });
        }

        const group = await Groups.findById(GroupID);
        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Group not found'
            });
        }

        const event = await Events.findById(group.EventID);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        const existingParticipant = await Participants.findOne({
            ParticipantEmail: ParticipantEmail,
            GroupID: GroupID
        });

        if (existingParticipant) {
            return res.status(400).json({
                success: false,
                message: 'Participant with this email already exists in this group'
            });
        }

        const groupParticipants = await Participants.countDocuments({ GroupID });
        if (event.GroupMaxParticipants && groupParticipants >= event.GroupMaxParticipants) {
            return res.status(400).json({
                success: false,
                message: `Group has reached maximum participants limit (${event.GroupMaxParticipants})`
            });
        }

        // Build participant data with mapped field names
        const participantData = {
            ParticipantName,
            ParticipantEmail,
            ParticipantMobile: mobile,
            ParticipantEnrollmentNumber: enrollment,
            ParticipantInsituteName,
            IsGroupLeader: IsGroupLeader || false,
            GroupID,
            ModifiedBy: req.user ? req.user._id : null
        };

        const participant = await Participants.create(participantData);

        const populatedParticipant = await Participants.findById(participant._id)
            .populate('GroupID', 'GroupName');

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

        if (req.body.ParticipantEmail && req.body.ParticipantEmail !== participant.ParticipantEmail) {
            const existingParticipant = await Participants.findOne({
                ParticipantEmail: req.body.ParticipantEmail,
                GroupID: participant.GroupID,
                _id: { $ne: req.params.id }
            });

            if (existingParticipant) {
                return res.status(400).json({
                    success: false,
                    message: 'Participant with this email already exists in this group'
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

            const event = await Events.findById(newGroup.EventID);
            const newGroupParticipants = await Participants.countDocuments({
                GroupID: req.body.GroupID
            });

            if (event && event.GroupMaxParticipants && newGroupParticipants >= event.GroupMaxParticipants) {
                return res.status(400).json({
                    success: false,
                    message: `Target group has reached maximum participants limit (${event.GroupMaxParticipants})`
                });
            }
        }

        req.body.ModifiedBy = req.user._id;
        participant = await Participants.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        })
            .populate('GroupID', 'GroupName EventID')
            .populate('ModifiedBy', 'UserName EmailAddress');

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
            .populate('GroupID', 'GroupName EventID');

        if (!participant) {
            return res.status(404).json({
                success: false,
                message: 'Participant not found'
            });
        }

        const event = participant.GroupID?.EventID
            ? await Events.findById(participant.GroupID.EventID)
            : null;

        const groupParticipants = await Participants.countDocuments({
            GroupID: participant.GroupID
        });

        if (event && event.GroupMinParticipants && groupParticipants <= event.GroupMinParticipants) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete participant. Group must have at least ${event.GroupMinParticipants} participants`
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
            .populate('ModifiedBy', 'UserName EmailAddress')
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
            .populate('ModifiedBy', 'UserName EmailAddress')
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
