const User = require("../models/UserModel");
const { ObjectId } = require('mongodb');

exports.getUserDetails = async (req, res) => {
    try {
        const { id } = req.query;
        const userDetails = await User.findOne({ _id: ObjectId.createFromHexString(id) });
        res.status(200).json({ data: userDetails, success: true, status: 200 });
    } catch (err) {
        console.error(err);
        res.status(400).json({ msg: err.message, status: 400, success: false });
    }
}

exports.updateUserDetails = async (req, res) => {
    try {
        const { id } = req.query;
        const userDetails = await User.findOneAndUpdate({ _id: ObjectId.createFromHexString(id) },
         { $set: { ...req.body } });
        res.status(200).json({ data: userDetails, success: true, status: 200 });
    } catch (err) {
        console.error(err);
        res.status(400).json({ msg: err.message, status: 400, success: false });
    }
}
