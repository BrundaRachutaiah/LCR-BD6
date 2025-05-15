const express = require("express")
const jwt = require("jsonwebtoken")
const app = express()
app.use(express.json())

let user = {
  email: "user@example.com",
  password: "securePassword123"
}

let attempts = {}

app.post("/login", async (req, res) => {
    let ip = req.ip

    if(!attempts[ip]){
        attempts[ip] = { count: 0, timestamp: Date.now()}
    }

    let currentTime = Date.now()
    let colapseTime = (currentTime - attempts[ip].timestamp)/1000

    if(colapseTime > 60){
        attempts[ip] = { count: 0, timestamp: Date.now()}
    }

    if(attempts[ip].count >= 5){
        res.status(404).json({error: "Too many login attempts. Try again later."})
    }

    let { email, password } = req.body
    if(email === user.email && password === user.password){
        attempts[ip] = { count: 0, timestamp: Date.now()}
        let token = jwt.sign({ email }, "secret_key" , { expiresIn: "1h" })
        return res.status(200).json({ success: true, token})
    }

    attempts[ip].count = attempts[ip].count + 1
    return res.status(500).json({error: "Invalid credencial"})
})

module.exports = { app }