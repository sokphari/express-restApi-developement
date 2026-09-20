const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret_in_production";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "change_this_refresh_secret_in_production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

const createAccessToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role,
        },
        JWT_SECRET,
        {
            expiresIn: JWT_EXPIRES_IN,
        }
    );
};

const verifyAccessToken = (token) => {
    return jwt.verify(token, JWT_SECRET);
};

const createRefreshToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
        },
        JWT_REFRESH_SECRET,
        {
            expiresIn: JWT_REFRESH_EXPIRES_IN,
        }
    );
};

const verifyRefreshToken = (token) => {
    return jwt.verify(token, JWT_REFRESH_SECRET);
};

module.exports = {
    createAccessToken,
    verifyAccessToken,
    createRefreshToken,
    verifyRefreshToken,
};
