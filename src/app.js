const express = require("express")
const dotenv  = require('dotenv')

dotenv.config();

const authRoutes = require("./routes/auth.routes")
const profileRoutes = require("./routes/profile.routes")
const adminRoutes = require("./routes/admin.routes")
const managerRoutes = require("./routes/manager.routes")


// calling route here

const app = express()
app.use(express.json())

//test routing
app.get("/", (req, res) => {
    res.json({
        message: "Product API running"
    });
});

app.use("/auth", authRoutes)
app.use("/profile", profileRoutes)
app.use("/admin", adminRoutes)
app.use("/manager", managerRoutes)

module.exports = app;
