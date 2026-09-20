const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");

const router = express.Router();

router.get("/dashboard", authMiddleware, authorizeRoles("admin"), (req, res) => {
    return res.status(200).json({
        message: "Admin dashboard access granted",
        user: req.user,
    });
});

module.exports = router;
