const { verifyAccessToken } = require("../utils/jwt");

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Access token is required",
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        req.user = verifyAccessToken(token);
        return next();
    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token",
        });
    }
};

module.exports = authMiddleware;
