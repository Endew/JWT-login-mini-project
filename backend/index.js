const express = require("express");
const cors = require("cors");
const db = require("./db");
const jwt = require("jsonwebtoken");

const app = express();

const PORT = 3001;
const JWT_SECRET = "1234567890";

app.use(cors());
app.use(express.json());

app.post("/login", async (req, res) => {
    console.log("req.body = ", req.body);
    const {username, password} = req.body;

    console.log("username = ", username);
    console.log("password = ", password);

    const user = await db("user").where({user_username: username}).first();

    console.log("user = ", user);

    if (!user.user_username && !user.user_password) {
        return res.status(401).json("Invalid username or password");
    }

    const token = jwt.sign({id: user.user_id, username: user.user_username}, JWT_SECRET, {expiresIn: "1h"});
    res.json({token});
});

app.get("/protected", (req, res, next) => {
    const authHeader = req.headers["authorization"]
    const token = authHeader.split(" ")[1]

    if (!token) {
        return res.status(401).json("No token");
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json("Invalid token")
        }
        req.user = user;
        res.json({
            message: "This is a protected route",
            username: user.username
        })
    })
})

app.listen(PORT, () => console.log("Server is running on port " + PORT));