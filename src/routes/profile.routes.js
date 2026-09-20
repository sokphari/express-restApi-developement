const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/", authMiddleware, (req, res) => {
    return res.status(200).json({
        message: "Protected profile access granted",
        user: req.user,
    });
});

module.exports = router;
