const User = require("../models/UserModel");
const UserRequest = require("../models/UserRequestModel");
const { ObjectId } = require('mongodb');

exports.getUserDetails = async (req, res) => {
    try {
        // const { id } = req.query;
        const id = "6736caf3987f91ea19b614b1";
        const userDetails = await User.findOne({ _id: ObjectId.createFromHexString(id) });
        res.status(200).json({ data: userDetails, success: true, status: 200 });
    } catch (err) {
        console.error(err);
        res.status(400).json({ msg: err.message, status: 400, success: false });
    }
}

exports.updateUserDetails = async (req, res) => {
    try {
        // const { id } = req.query;
        const id = "6736caf3987f91ea19b614b1";
        const userDetails = await User.findOneAndUpdate({ _id: ObjectId.createFromHexString(id) },
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

        if (q && q.length > 0) {
            const skip = (pageInt - 1) * limitInt;

            const aggregateData = await User.aggregate([
                {
                    $facet: {
                        content: [
                            {
                                $match: {
                                    username: {
                                        $regex: q,
                                        $options: "i"
                                    }
                                }
                            },
                            {
                                $skip: skip
                            },
                            {
                                $limit: limitInt
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
        const id = "6736caf3987f91ea19b614b1";
        const requestedTo = req.body.requestedTo;
        const requestedDetails = await UserRequest.create({ requestedUser: id, requestedTo: requestedTo });
        res.status(200).json({ data: requestedDetails, success: true, status: 200 });
    } catch (err) {
        console.error(err);
        res.status(400).json({ msg: err.message, status: 400, success: false });
    }
}

exports.changeUserRequestStatus = async (req, res) => {
    try {
        // const { id } = req.query;
        const id = "6736caf3987f91ea19b614b1";
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