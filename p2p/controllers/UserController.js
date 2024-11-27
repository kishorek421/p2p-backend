const User = require("../models/UserModel");
const UserRequest = require("../models/UserRequestModel");
const { ObjectId } = require('mongodb');

exports.getUserDetails = async (req, res) => {
    try {
        console.log("user", req.user);

        const id = req.user._id;
        // const id = "6736caf3987f91ea19b614b1";
        let userDetails = await User.findOne({ _id: id }).lean();
        const userFollowing = await UserRequest.countDocuments({ $and: [{ 'requestedUser': id }, { 'requestStatus': 'Accepted' }] });
        const userFollowers = await UserRequest.countDocuments({ $and: [{ 'requestedTo': id }, { 'requestStatus': 'Accepted' }] });
        userDetails['following'] = userFollowing;
        userDetails['followers'] = userFollowers;
        res.status(200).json({ data: userDetails, success: true, status: 200 });
    } catch (err) {
        console.error(err);
        res.status(400).json({ msg: err.message, status: 400, success: false });
    }
}

exports.updateUserDetails = async (req, res) => {
    try {
        // const { id } = req.query;
        // const id =  ObjectId.createFromHexString("6736caf3987f91ea19b614b1");
        const id = req.user._id;
        const userDetails = await User.findOneAndUpdate({ _id: id },
            { $set: { ...req.body } }, { new: true, runValidators: true });
        res.status(200).json({ data: userDetails, success: true, status: 200 });
    } catch (err) {
        console.error(err);
        res.status(400).json({ msg: err.message, status: 400, success: false });
    }
}

exports.searchUsers = async (req, res) => {
    try {
        const { pageNo = 1, pageSize = 10, q = "" } = req.query;
        const pageInt = parseInt(pageNo);
        const limitInt = parseInt(pageSize);
        const { id } = req.user._id;
        if (q && q.length > 0) {
            const skip = (pageInt - 1) * limitInt;

            const aggregateData = await User.aggregate([
                {
                    $facet: {
                        content: [
                            {
                                $match: {
                                    _id: { $ne: id },
                                    username: {
                                        $regex: q,
                                        $options: "i"
                                    },
                                }
                            },
                            {
                                $skip: skip
                            },
                            {
                                $limit: limitInt
                            },
                            {
                                $lookup: {
                                    from: "userrequests",
                                    let: {
                                        pId: "$_id",
                                        userId: id
                                    },
                                    pipeline: [
                                        {
                                            $match: {
                                                $expr: {
                                                    $or: [
                                                        {
                                                            $and: [
                                                                {
                                                                    $eq: [
                                                                        "$requestedTo",
                                                                        "$$userId"
                                                                    ]
                                                                },
                                                                {
                                                                    $eq: [
                                                                        "$requestedUser",
                                                                        "$$pId"
                                                                    ]
                                                                }
                                                            ]
                                                        },
                                                        {
                                                            $and: [
                                                                {
                                                                    $eq: [
                                                                        "$requestedUser",
                                                                        "$$userId"
                                                                    ]
                                                                },
                                                                {
                                                                    $eq: [
                                                                        "$requestedTo",
                                                                        "$$pId"
                                                                    ]
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                }
                                            }
                                        },
                                        {
                                            $project: {
                                                requestStatus: 1
                                            }
                                        }
                                    ],
                                    as: "userRequestDetails"
                                }
                            },
                            {
                                $unwind: {
                                    path: "$userRequestDetails",
                                    preserveNullAndEmptyArrays: true
                                }
                            },
                            {
                                $project: {
                                    requestStatus:
                                        "$userRequestDetails.requestStatus",
                                    username: 1,
                                    mobileNo: 1,
                                    status: 1
                                }
                            }
                        ],
                        count: [
                            {
                                $match: {
                                    username: {
                                        $regex: q,
                                        $options: "i"
                                    }
                                }
                            },
                            {
                                $count: "count"
                            }
                        ]
                    }
                }
            ]);
            console.log(aggregateData[0]);
            let totalItems = 0;
            let data = [];
            if (aggregateData && aggregateData.length > 0) {
                const countData = aggregateData[0].count;
                if (countData && countData.length > 0) {
                    const totalCount = countData[0].count;
                    if (totalCount) {
                        totalItems = totalCount;
                    }
                }
                const contentData = aggregateData[0].content;
                if (contentData && contentData.length > 0) {
                    data = contentData;
                }
            }
            res.status(200).json({
                data: {
                    content: data,
                    paginator: {
                        pageNo: pageInt,
                        pageSize: limitInt,
                        totalItems: totalItems,
                        totalPages: Math.ceil(totalItems / limitInt),
                        q: q,
                    }
                }, success: true, status: 200
            });
        } else {
            res.status(200).json({
                data: {
                    content: [],
                    paginator: {
                        pageNo: pageInt,
                        pageSize: limitInt,
                        totalItems: 0,
                        totalPages: 0,
                        q: "",
                    },
                }, success: true, status: 200
            });
        }
    } catch (err) {
        console.error(err);
        res.status(400).json({ msg: err.message, status: 400, success: false });
    }
}

exports.requestUser = async (req, res) => {
    try {
        // const { id } = req.query;
        // const id = "6736caf3987f91ea19b614b1";
        const id = req.user._id;
        const requestedTo = req.body.requestedTo;
        const requestedToObjectId = ObjectId.createFromHexString(requestedTo);
        const isExist = await UserRequest.find({ $or: [{ $and: [{ requestedUser: id, requestedTo: requestedToObjectId }] }, { $and: [{ requestedUser: requestedToObjectId, requestedTo: id }] }] });
        if (isExist.length > 0) {
            res.status(400).json({ msg: "You have already requested this user", status: 400, success: false });
            return;
        }
        const requestedDetails = await UserRequest.create({ requestedUser: id, requestedTo: requestedToObjectId });
        res.status(200).json({ data: requestedDetails, success: true, status: 200 });
    } catch (err) {
        console.error(err);
        res.status(400).json({ msg: err.message, status: 400, success: false });
    }
}

exports.changeUserRequestStatus = async (req, res) => {
    try {
        // const { id } = req.query;
        // const id = "6736caf3987f91ea19b614b1";
        const id = req.user._id;
        const userRequestId = req.body.userRequestId;
        const requestStatus = req.body.requestStatus;
        const requestedDetails = await UserRequest.findOneAndUpdate({ _id: userRequestId, requestedUser: id },
            { $set: { requestStatus: requestStatus } },
            { new: true, runValidators: true });
        res.status(200).json({ data: requestedDetails, success: true, status: 200 });
    } catch (err) {
        console.error(err);
        res.status(400).json({ msg: err.message, status: 400, success: false });
    }
}

exports.getUserRequests = async (req, res) => {
    try {
        const id = req.user._id;
        const { type } = req.query;
        // const { requestStatus } = req.qeury;
        let query;
        if (type === "Requests") {
            query = { 'requestedTo': id, 'requestStatus': 'Requested' };
        } else if (type === "Requested") {
            query = { 'requestedUser': id, 'requestStatus': 'Requested' };
        } else {
            res.status(400).json({ msg: "Invalid type", status: 400, success: false });
            return;
        }
        const userRequests = await UserRequest.find(query).populate('requestedTo').populate('requestedUser');
        res.status(200).json({ data: userRequests, success: true, status: 200 });
    } catch (err) {
        console.error(err);
        res.status(400).json({ msg: err.message, status: 400, success: false });
    }
}

exports.getUserFriends = async (req, res) => {
    try {
        const id = req.user._id;
        const userFriends = await UserRequest.find({
            $and: [{ 'requestStatus': 'Accepted' },
            { $or: [{ 'requestedTo': id }, { 'requestedUser': id }] }]
        })
            .populate('requestedTo').populate('requestedUser');
        res.status(200).json({ data: userFriends, success: true, status: 200 });
    } catch (err) {
        console.error(err);
        res.status(400).json({ msg: err.message, status: 400, success: false });
    }
}
