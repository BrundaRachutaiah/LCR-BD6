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
    const ip = req.ip

    if (!attempts[ip]) {
        attempts[ip] = { count: 0, timestamp: Date.now() }
    }

    const currentTime = Date.now()
    const elapsed = (currentTime - attempts[ip].timestamp) / 1000

    if (elapsed > 60) {
        attempts[ip] = { count: 0, timestamp: Date.now() }
    }

    if (attempts[ip].count >= 5) {
        return res.status(429).json({ error: "Too many login attempts. Try again later." })
    }

    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" })
    }

    if (email === user.email && password === user.password) {
        attempts[ip] = { count: 0, timestamp: Date.now() }
        const token = jwt.sign({ email }, "secret_key", { expiresIn: "1h" })
        return res.status(200).json({ success: true, token })
    }

    attempts[ip].count++
    return res.status(400).json({ error: "Invalid credentials" })
})

module.exports = { app, attempts }
