const EventWiseWinners = require('../models/EventWiseWinner');
const Events = require('../models/Event');
const Groups = require('../models/Group');

exports.getWinners = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const startIndex = (page - 1) * limit;

        let query = {};
        if (req.query.eventId) {
            query.EventID = req.query.eventId;
        }
        if (req.query.groupId) {
            query.GroupID = req.query.groupId;
        }
        if (req.query.position) {
            query.Sequence = req.query.position;
        }

        const total = await EventWiseWinners.countDocuments(query);
        const winners = await EventWiseWinners.find(query)
            .populate('EventID', 'EventName DepartmentID EventDate')
            .populate('GroupID', 'GroupName EventID')
            .populate('ModifiedBy', 'UserName EmailAddress')
            .limit(limit)
            .skip(startIndex)
            .sort({ EventID: 1, Sequence: 1 });

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
            count: winners.length,
            total,
            pagination,
            data: winners
        });
    } catch (error) {
        next(error);
    }
};

exports.getWinner = async (req, res, next) => {
    try {
        const winner = await EventWiseWinners.findById(req.params.id)
            .populate('EventID', 'EventName DepartmentID EventDate')
            .populate('GroupID', 'GroupName EventID')
            .populate('ModifiedBy', 'UserName EmailAddress');

        if (!winner) {
            return res.status(404).json({
                success: false,
                message: 'Winner not found'
            });
        }

        res.status(200).json({
            success: true,
            data: winner
        });
    } catch (error) {
        next(error);
    }
};

exports.createWinner = async (req, res, next) => {
    try {
        const { EventID, GroupID, Sequence, PrizeAmount, Remarks } = req.body;

        if (!EventID || !GroupID || !Sequence) {
            return res.status(400).json({
                success: false,
                message: 'Please provide EventID, GroupID, and Sequence'
            });
        }

        const positionNum = parseInt(Sequence);
        if (!positionNum || positionNum < 1) {
            return res.status(400).json({
                success: false,
                message: 'Sequence must be a positive integer'
            });
        }

        const event = await Events.findById(EventID);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        const group = await Groups.findById(GroupID);
        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Group not found'
            });
        }

        if (group.EventID.toString() !== EventID) {
            return res.status(400).json({
                success: false,
                message: 'Group does not belong to the specified event'
            });
        }

        const existingWinner = await EventWiseWinners.findOne({
            EventID: req.body.EventID,
            Sequence: req.body.Sequence
        });

        if (existingWinner) {
            return res.status(400).json({
                success: false,
                message: `Sequence ${req.body.Sequence} already exists for this event`
            });
        }

        const existingGroupWinner = await EventWiseWinners.findOne({
            EventID: req.body.EventID,
            GroupID: req.body.GroupID
        });

        if (existingGroupWinner) {
            return res.status(400).json({
                success: false,
                message: 'This group is already a winner in this event'
            });
        }

        req.body.ModifiedBy = req.user._id;
        const winner = await EventWiseWinners.create(req.body);

        const populatedWinner = await EventWiseWinners.findById(winner._id)
            .populate('EventID', 'EventName DepartmentID EventDate')
            .populate('GroupID', 'GroupName EventID')
            .populate('ModifiedBy', 'UserName EmailAddress');

        res.status(201).json({
            success: true,
            data: populatedWinner,
            message: 'Winner created successfully'
        });
    } catch (error) {
        next(error);
    }
};

exports.updateWinner = async (req, res, next) => {
    try {
        let winner = await EventWiseWinners.findById(req.params.id);

        if (!winner) {
            return res.status(404).json({
                success: false,
                message: 'Winner not found'
            });
        }

        if (req.body.Sequence !== undefined) {
            if (!Number.isInteger(req.body.Sequence) || req.body.Sequence < 1) {
                return res.status(400).json({
                    success: false,
                    message: 'Sequence must be a positive integer'
                });
            }

            if (req.body.Sequence !== winner.Sequence) {
                const existingWinner = await EventWiseWinners.findOne({
                    EventID: winner.EventID,
                    Sequence: req.body.Sequence,
                    _id: { $ne: req.params.id }
                });

                if (existingWinner) {
                    return res.status(400).json({
                        success: false,
                        message: `Sequence ${req.body.Sequence} already exists for this event`
                    });
                }
            }
        }

        if (req.body.GroupID && req.body.GroupID !== winner.GroupID.toString()) {
            const newGroup = await Groups.findById(req.body.GroupID);
            if (!newGroup) {
                return res.status(404).json({
                    success: false,
                    message: 'Group not found'
                });
            }

            if (newGroup.EventID.toString() !== winner.EventID.toString()) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot change winner to a group from a different event'
                });
            }

            const existingGroupWinner = await EventWiseWinners.findOne({
                EventID: winner.EventID,
                GroupID: req.body.GroupID,
                _id: { $ne: req.params.id }
            });

            if (existingGroupWinner) {
                return res.status(400).json({
                    success: false,
                    message: 'This group is already a winner in this event'
                });
            }
        }

        req.body.ModifiedBy = req.user._id;
        winner = await EventWiseWinners.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        })
            .populate('EventID', 'EventName DepartmentID EventDate')
            .populate('GroupID', 'GroupName EventID')
            .populate('ModifiedBy', 'UserName EmailAddress');

        res.status(200).json({
            success: true,
            data: winner,
            message: 'Winner updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteWinner = async (req, res, next) => {
    try {
        const winner = await EventWiseWinners.findById(req.params.id)
            .populate('EventID', 'EventName DepartmentID')
            .populate('GroupID', 'GroupName EventID');

        if (!winner) {
            return res.status(404).json({
                success: false,
                message: 'Winner not found'
            });
        }

        const winnerData = winner.toObject();
        await EventWiseWinners.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            data: winnerData,
            message: 'Winner deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

exports.getWinnersByEvent = async (req, res, next) => {
    try {
        const winners = await EventWiseWinners.find({ EventID: req.params.id })
            .populate('EventID', 'EventName DepartmentID EventDate')
            .populate('GroupID', 'GroupName EventID')
            .populate('ModifiedBy', 'UserName EmailAddress')
            .sort({ Sequence: 1 });

        res.status(200).json({
            success: true,
            count: winners.length,
            data: winners
        });
    } catch (error) {
        next(error);
    }
};

exports.getWinnersByGroup = async (req, res, next) => {
    try {
        const winners = await EventWiseWinners.find({ GroupID: req.params.id })
            .populate('EventID', 'EventName DepartmentID EventDate')
            .populate('GroupID', 'GroupName EventID')
            .populate('ModifiedBy', 'UserName EmailAddress')
            .sort({ Sequence: 1 });

        res.status(200).json({
            success: true,
            count: winners.length,
            data: winners
        });
    } catch (error) {
        next(error);
    }
};
