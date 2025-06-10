import pkg from "jsonwebtoken";
import { ObjectId } from "mongodb";
import UserModel from "../models/UserModel.js";

const { verify } = pkg;

const authenticateToken = async (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  console.log("token", token);

  if (!token)
    return res.status(401).json({
      msg: "Access token required",
      status: 401,
      success: false,
      isTokenExpired: true,
    });

  try {
    const decoded = verify(token, process.env.JWT_SECRET);
    let user = await UserModel.findOne({
      _id: ObjectId.createFromHexString(decoded.id),
    });

    if (!user) {
      return res
        .status(404)
        .json({ msg: "User not found", status: 404, success: false });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error(err);
    return res.sendStatus(403).json({
      msg: "Token is invalid or expired",
      status: 403,
      success: false,
      isTokenExpired: true,
    });
  }
};

export default authenticateToken;
