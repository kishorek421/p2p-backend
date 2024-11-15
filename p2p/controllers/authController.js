// const jwt = require('jsonwebtoken');
// const User = require('../models/UserModel');
// const { ObjectId } = require('mongodb');

// // Function to generate a JWT
// const generateToken = (userId, userType, role) => {
//     return jwt.sign(
//         { id: userId, userType, role }, // Include role in token
//         process.env.JWT_SECRET,
//         { expiresIn: process.env.JWT_EXPIRATION }
//     );
// };

// // Login an existing user
// exports.login = async (req, res) => {
//     const { username, password, userType } = req.body;

//     // Check if userType is provided and valid
//     if (![SUPER_ADMIN, CHIEF_ADMIN, 
//         HOST, GATE_GAURD
//     ].includes(userType)) {
//         const errorModel = {
//             value: userType,
//             param: "userType",
//             msg: "Invalid user type",
//         };
//         return res.status(404).json({ errors: [errorModel], status: 404, success: false });
//     }

//     try {
//         let baseUserDetails;

//         // Retrieve the user based on userType
//         if (userType === SUPER_ADMIN) {
//             baseUserDetails = await SuperAdmin.findOne({ username: { $regex: new RegExp('^' + username+ '$', 'i') } });
//         } else  if (userType === CHIEF_ADMIN) {
//             baseUserDetails = await ChiefAdmin.findOne({ username: { $regex: new RegExp('^' + username+ '$', 'i') } });
//         } else  if (userType === HOST) {
//             baseUserDetails = await Host.findOne({ username: { $regex: new RegExp('^' + username+ '$', 'i') } });
//         } else  if (userType === VISITOR) {
//             baseUserDetails = await Visitor.findOne({ username: { $regex: new RegExp('^' + username+ '$', 'i') } });
//         } else  if (userType === GATE_GAURD) {
//             baseUserDetails = await GateGaurd.findOne({ username: { $regex: new RegExp('^' + username+ '$', 'i') } });
//         }

//         console.log("baseUserDetails", baseUserDetails);

//         if (!baseUserDetails) {
//             const errorModel = {
//                 value: username,
//                 param: "username",
//                 msg: "Invalid username",
//             };
//             return res.status(404).json({ errors: [errorModel], status: 404, success: false });
//         }

//         // Verify the password
//         const isPasswordValid = await bcrypt.compare(password, baseUserDetails.password);
//         if (!isPasswordValid) {
//             const errorModel = {
//                 value: password,
//                 param: "password",
//                 msg: "Invalid password",
//             };
//             return res.status(404).json({ errors: [errorModel], status: 404, success: false });
//         }

//         let userWithRoleModulePermissionsDetails;

//         if (userType === CHIEF_ADMIN) {
//             userWithRoleModulePermissionsDetails = await ChiefAdmin.aggregate([
//                 {
//                     $match: {
//                         _id: ObjectId.createFromHexString(baseUserDetails.id),
//                     }
//                 },
//                 {
//                     $lookup: {
//                         from: "roles",
//                         localField: "role",
//                         foreignField: "_id",
//                         as: "roleDetails"
//                     }
//                 },
//                 {
//                     $unwind: {
//                         path: "$roleDetails",
//                         preserveNullAndEmptyArrays: true
//                     }
//                 },
//                 {
//                     $lookup: {
//                         from: "rolemodulepermissions",
//                         localField: "role",
//                         foreignField: "roleId",
//                         as: "modulePermissionDetails",
//                         pipeline: [
//                             {
//                                 $lookup: {
//                                     from: "modules",
//                                     localField: "moduleId",
//                                     foreignField: "_id",
//                                     as: "moduleDetails"
//                                 }
//                             },
//                             {
//                                 $unwind: {
//                                     path: "$moduleDetails",
//                                     preserveNullAndEmptyArrays: true
//                                 }
//                             },
//                             {
//                                 $lookup: {
//                                     from: "permissions",
//                                     localField: "permissionId",
//                                     foreignField: "_id",
//                                     as: "permissionDetails"
//                                 }
//                             },
//                             {
//                                 $unwind: {
//                                     path: "$permissionDetails",
//                                     preserveNullAndEmptyArrays: true
//                                 }
//                             },
//                             {
//                                 $project: {
//                                     moduleDetails: 1,
//                                     permissionDetails: 1
//                                 }
//                             },
//                             {
//                                 $group: {
//                                     _id: "$moduleDetails._id",
//                                     moduleDetails: {
//                                         $first: "$moduleDetails"
//                                     },
//                                     permissions: {
//                                         $push: "$permissionDetails"
//                                     }
//                                 }
//                             }
//                         ]
//                     }
//                 },
//                 {
//                     $unwind: {
//                         path: "$roleDetails",
//                         preserveNullAndEmptyArrays: true
//                     }
//                 },
//                 {
//                     $project: {
//                         userDetails: {
//                             username: "$username",
//                             uniqueId: "$uniqueId"
//                         },
//                         roleDetails: 1,
//                         modulePermissionDetails: 1
//                     }
//                 }
//             ]);
//         } else if (userType === SUPER_ADMIN) {
//             userWithRoleModulePermissionsDetails = await SuperAdmin.aggregate([
//                 {
//                     $match: {
//                         _id: ObjectId.createFromHexString(baseUserDetails.id),
//                     }
//                 },
//                 {
//                     $lookup: {
//                         from: "roles",
//                         localField: "role",
//                         foreignField: "_id",
//                         as: "roleDetails"
//                     }
//                 },
//                 {
//                     $unwind: {
//                         path: "$roleDetails",
//                         preserveNullAndEmptyArrays: true
//                     }
//                 },
//                 {
//                     $lookup: {
//                         from: "rolemodulepermissions",
//                         localField: "role",
//                         foreignField: "roleId",
//                         as: "modulePermissionDetails",
//                         pipeline: [
//                             {
//                                 $lookup: {
//                                     from: "modules",
//                                     localField: "moduleId",
//                                     foreignField: "_id",
//                                     as: "moduleDetails"
//                                 }
//                             },
//                             {
//                                 $unwind: {
//                                     path: "$moduleDetails",
//                                     preserveNullAndEmptyArrays: true
//                                 }
//                             },
//                             {
//                                 $lookup: {
//                                     from: "permissions",
//                                     localField: "permissionId",
//                                     foreignField: "_id",
//                                     as: "permissionDetails"
//                                 }
//                             },
//                             {
//                                 $unwind: {
//                                     path: "$permissionDetails",
//                                     preserveNullAndEmptyArrays: true
//                                 }
//                             },
//                             {
//                                 $project: {
//                                     moduleDetails: 1,
//                                     permissionDetails: 1
//                                 }
//                             },
//                             {
//                                 $group: {
//                                     _id: "$moduleDetails._id",
//                                     moduleDetails: {
//                                         $first: "$moduleDetails"
//                                     },
//                                     permissions: {
//                                         $push: "$permissionDetails"
//                                     }
//                                 }
//                             }
//                         ]
//                     }
//                 },
//                 {
//                     $unwind: {
//                         path: "$roleDetails",
//                         preserveNullAndEmptyArrays: true
//                     }
//                 },
//                 {
//                     $project: {
//                         userDetails: {
//                             username: "$username",
//                             uniqueId: "$uniqueId"
//                         },
//                         roleDetails: 1,
//                         modulePermissionDetails: 1
//                     }
//                 }
//             ]);
//         } else if (userType === HOST) {
//             userWithRoleModulePermissionsDetails = await Host.aggregate([
//                 {
//                     $match: {
//                         _id: ObjectId.createFromHexString(baseUserDetails.id),
//                     }
//                 },
//                 {
//                     $lookup: {
//                         from: "roles",
//                         localField: "role",
//                         foreignField: "_id",
//                         as: "roleDetails"
//                     }
//                 },
//                 {
//                     $unwind: {
//                         path: "$roleDetails",
//                         preserveNullAndEmptyArrays: true
//                     }
//                 },
//                 {
//                     $lookup: {
//                         from: "rolemodulepermissions",
//                         localField: "role",
//                         foreignField: "roleId",
//                         as: "modulePermissionDetails",
//                         pipeline: [
//                             {
//                                 $lookup: {
//                                     from: "modules",
//                                     localField: "moduleId",
//                                     foreignField: "_id",
//                                     as: "moduleDetails"
//                                 }
//                             },
//                             {
//                                 $unwind: {
//                                     path: "$moduleDetails",
//                                     preserveNullAndEmptyArrays: true
//                                 }
//                             },
//                             {
//                                 $lookup: {
//                                     from: "permissions",
//                                     localField: "permissionId",
//                                     foreignField: "_id",
//                                     as: "permissionDetails"
//                                 }
//                             },
//                             {
//                                 $unwind: {
//                                     path: "$permissionDetails",
//                                     preserveNullAndEmptyArrays: true
//                                 }
//                             },
//                             {
//                                 $project: {
//                                     moduleDetails: 1,
//                                     permissionDetails: 1
//                                 }
//                             },
//                             {
//                                 $group: {
//                                     _id: "$moduleDetails._id",
//                                     moduleDetails: {
//                                         $first: "$moduleDetails"
//                                     },
//                                     permissions: {
//                                         $push: "$permissionDetails"
//                                     }
//                                 }
//                             }
//                         ]
//                     }
//                 },
//                 {
//                     $unwind: {
//                         path: "$roleDetails",
//                         preserveNullAndEmptyArrays: true
//                     }
//                 },
//                 {
//                     $project: {
//                         userDetails: {
//                             username: "$username",
//                             uniqueId: "$uniqueId"
//                         },
//                         roleDetails: 1,
//                         modulePermissionDetails: 1
//                     }
//                 }
//             ]);
//         } else if (userType === VISITOR) {
//             userWithRoleModulePermissionsDetails = await Visitor.aggregate([
//                 {
//                     $match: {
//                         _id: ObjectId.createFromHexString(baseUserDetails.id),
//                     }
//                 },
//                 {
//                     $lookup: {
//                         from: "roles",
//                         localField: "role",
//                         foreignField: "_id",
//                         as: "roleDetails"
//                     }
//                 },
//                 {
//                     $unwind: {
//                         path: "$roleDetails",
//                         preserveNullAndEmptyArrays: true
//                     }
//                 },
//                 {
//                     $lookup: {
//                         from: "rolemodulepermissions",
//                         localField: "role",
//                         foreignField: "roleId",
//                         as: "modulePermissionDetails",
//                         pipeline: [
//                             {
//                                 $lookup: {
//                                     from: "modules",
//                                     localField: "moduleId",
//                                     foreignField: "_id",
//                                     as: "moduleDetails"
//                                 }
//                             },
//                             {
//                                 $unwind: {
//                                     path: "$moduleDetails",
//                                     preserveNullAndEmptyArrays: true
//                                 }
//                             },
//                             {
//                                 $lookup: {
//                                     from: "permissions",
//                                     localField: "permissionId",
//                                     foreignField: "_id",
//                                     as: "permissionDetails"
//                                 }
//                             },
//                             {
//                                 $unwind: {
//                                     path: "$permissionDetails",
//                                     preserveNullAndEmptyArrays: true
//                                 }
//                             },
//                             {
//                                 $project: {
//                                     moduleDetails: 1,
//                                     permissionDetails: 1
//                                 }
//                             },
//                             {
//                                 $group: {
//                                     _id: "$moduleDetails._id",
//                                     moduleDetails: {
//                                         $first: "$moduleDetails"
//                                     },
//                                     permissions: {
//                                         $push: "$permissionDetails"
//                                     }
//                                 }
//                             }
//                         ]
//                     }
//                 },
//                 {
//                     $unwind: {
//                         path: "$roleDetails",
//                         preserveNullAndEmptyArrays: true
//                     }
//                 },
//                 {
//                     $project: {
//                         userDetails: {
//                             username: "$username",
//                             uniqueId: "$uniqueId"
//                         },
//                         roleDetails: 1,
//                         modulePermissionDetails: 1
//                     }
//                 }
//             ]);
//         } else if (userType === GATE_GAURD) {
//             userWithRoleModulePermissionsDetails = await GateGaurd.aggregate([
//                 {
//                     $match: {
//                         _id: ObjectId.createFromHexString(baseUserDetails.id),
//                     }
//                 },
//                 {
//                     $lookup: {
//                         from: "roles",
//                         localField: "role",
//                         foreignField: "_id",
//                         as: "roleDetails"
//                     }
//                 },
//                 {
//                     $unwind: {
//                         path: "$roleDetails",
//                         preserveNullAndEmptyArrays: true
//                     }
//                 },
//                 {
//                     $lookup: {
//                         from: "rolemodulepermissions",
//                         localField: "role",
//                         foreignField: "roleId",
//                         as: "modulePermissionDetails",
//                         pipeline: [
//                             {
//                                 $lookup: {
//                                     from: "modules",
//                                     localField: "moduleId",
//                                     foreignField: "_id",
//                                     as: "moduleDetails"
//                                 }
//                             },
//                             {
//                                 $unwind: {
//                                     path: "$moduleDetails",
//                                     preserveNullAndEmptyArrays: true
//                                 }
//                             },
//                             {
//                                 $lookup: {
//                                     from: "permissions",
//                                     localField: "permissionId",
//                                     foreignField: "_id",
//                                     as: "permissionDetails"
//                                 }
//                             },
//                             {
//                                 $unwind: {
//                                     path: "$permissionDetails",
//                                     preserveNullAndEmptyArrays: true
//                                 }
//                             },
//                             {
//                                 $project: {
//                                     moduleDetails: 1,
//                                     permissionDetails: 1
//                                 }
//                             },
//                             {
//                                 $group: {
//                                     _id: "$moduleDetails._id",
//                                     moduleDetails: {
//                                         $first: "$moduleDetails"
//                                     },
//                                     permissions: {
//                                         $push: "$permissionDetails"
//                                     }
//                                 }
//                             }
//                         ]
//                     }
//                 },
//                 {
//                     $unwind: {
//                         path: "$roleDetails",
//                         preserveNullAndEmptyArrays: true
//                     }
//                 },
//                 {
//                     $project: {
//                         userDetails: {
//                             username: "$username",
//                             uniqueId: "$uniqueId"
//                         },
//                         roleDetails: 1,
//                         modulePermissionDetails: 1
//                     }
//                 }
//             ]);
//         }

//         console.log("userWithRoleModulePermissionsDetails ->", userWithRoleModulePermissionsDetails[0]);

//         if (!userWithRoleModulePermissionsDetails || userWithRoleModulePermissionsDetails.length === 0) {
//             userWithRoleModulePermissionsDetails = {};
//         } else {
//             userWithRoleModulePermissionsDetails = userWithRoleModulePermissionsDetails[0];
//         }

//         // Generate token
//         const token = generateToken(baseUserDetails._id.toString(), userType, baseUserDetails.role);

//         res.json({ data: { token, ...userWithRoleModulePermissionsDetails }, success: true, status: 200, });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: "Server error" });
//     }
// };