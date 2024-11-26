const RefreshToken = require("../models/RefreshToken");

const generateToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRATION }
    );
};

async function generateRefreshToken(userId) {
    const token = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION });
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Set expiry date to 7 days

    // Save refresh token to the database
    const refreshToken = new RefreshToken({ userId, token, expiresAt });
    await refreshToken.save();
    return token;
}

exports.refreshToken = async (req, res) => {
    const { refreshToken } = req.query;

    if (!refreshToken) return res.status(401).json({ msg: 'Refresh token required', status: 401, success: false, isRefreshTokenExpired: true });

    // Find the refresh token in the database
    const storedToken = await RefreshToken.findOne({ token: refreshToken });
    if (!storedToken) return res.status(403).json({ msg: 'Refresh token is invalid or expired', status: 403, success: false, isRefreshTokenExpired: true });

    try {
        // Verify the refresh token
        const { userId } = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

        // Generate new tokens
        const token = generateToken(userId);
        const newRefreshToken = await generateRefreshToken(userId);

        // Delete the old refresh token from the database
        await RefreshToken.deleteOne({ token: refreshToken });

        res.json({ token, refreshToken: newRefreshToken });
    } catch (err) {
        await RefreshToken.deleteOne({ token: refreshToken }); // Remove invalid token
        res.status(403).json({ msg: 'Refresh token is invalid or expired', status: 403, success: false, });
    }
};