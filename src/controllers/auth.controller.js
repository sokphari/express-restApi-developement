const bcrypt = require("bcrypt");
const User = require("../models/user.model");
const {
    createAccessToken,
    createRefreshToken,
    verifyRefreshToken,
} = require("../utils/jwt");

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email, and password are required",
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters",
            });
        }

        const existingUser = await User.findUserByEmail(email);

        if (existingUser) {
            return res.status(409).json({
                message: "Email already registered",
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const user = await User.createUser({
            name,
            email,
            passwordHash,
        });

        return res.status(201).json({
            message: "User registered successfully",
            user,
        });
    } catch (error) {
        console.error("Register error:", error);

        return res.status(500).json({
            message: "Server error",
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required",
            });
        }

        const user = await User.findUserByEmail(email);

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        const loggedInUser = await User.updateLoginAt(user.id);
        const accessToken = createAccessToken(loggedInUser);
        const refreshToken = createRefreshToken(loggedInUser);

        await User.updateRefreshToken(loggedInUser.id, refreshToken);

        return res.status(200).json({
            message: "Login successful",
            accessToken,
            refreshToken,
            user: loggedInUser,
        });
    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            message: "Server error",
        });
    }
};

const me = async (req, res) => {
    try {
        const user = await User.findUserById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        return res.status(200).json({
            message: "Current user fetched successfully",
            user,
        });
    } catch (error) {
        console.error("Me error:", error);

        return res.status(500).json({
            message: "Server error",
        });
    }
};

const refresh = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                message: "Refresh token is required",
            });
        }

        const decoded = verifyRefreshToken(refreshToken);
        const user = await User.findUserByRefreshToken(refreshToken);

        if (!user || user.id !== decoded.id) {
            return res.status(401).json({
                message: "Invalid refresh token",
            });
        }

        const accessToken = createAccessToken(user);

        return res.status(200).json({
            message: "Access token refreshed successfully",
            accessToken,
        });
    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired refresh token",
        });
    }
};

const logout = async (req, res) => {
    try {
        await User.updateRefreshToken(req.user.id, null);

        return res.status(200).json({
            message: "Logout successful",
        });
    } catch (error) {
        console.error("Logout error:", error);

        return res.status(500).json({
            message: "Server error",
        });
    }
};

module.exports = {
    register,
    login,
    me,
    refresh,
    logout,
};
