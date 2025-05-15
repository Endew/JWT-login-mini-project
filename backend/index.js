const express = require("express");
const cors = require("cors");
const db = require("./db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const app = express();

const PORT = 3001;
const JWT_SECRET = "1234567890";
const salt = 10;

app.use(cors());
app.use(express.json());

app.post("/register", async (req, res) => {
    const {register_username, register_password} = req.body;

    console.log("register_username = ", register_username);
    console.log("register_password = ", register_password);

    const user = await db("user").where({user_username: register_username}).first();

    if (user) {
        return res.status(400).json("User already exists");
    }

    try {
        const hash = await bcrypt.hash(register_password, salt)
        
        console.log("Hash password = ",hash)

        const register = await db("user").insert({
            user_username: register_username,
            user_password: hash
        })
        res.json({
            message: "Register success",
            data: register
        })
    } catch (error) {
        console.error("Error inserting user: ", error);
        return res.status(500).json("Error inserting user");
    }
})

app.post("/login", async (req, res) => {
    console.log("req.body = ", req.body);
    const username = req.body.username;
    const password = req.body.password;

    console.log("username = ", username);
    console.log("password = ", password);

    const user = await db("user").where({user_username: username}).first();

    console.log("user = ", user);

    if (!user) {
        return res.status(401).json("User not found");
    }

    const checkPassword = await bcrypt.compare(password, user.user_password)
    console.log("checkPassword = ", checkPassword);

    if (!checkPassword) {
        return res.status(401).json("Incorrect password")
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