const request = require("supertest")
const http = require("http")
const { app, attempts } = require("../index")

let server

jest.setTimeout(70000) 

beforeAll((done) => {
    server = http.createServer(app)
    server.listen(3001, done)
})

afterAll((done) => {
    server.close(done)
})

beforeEach(() => {
    for (let ip in attempts) delete attempts[ip]
})

describe("API testing of login", () => {
    it("should return 200 for successful login", async () => {
        const res = await request(server)
            .post("/login")
            .send({ email: "user@example.com", password: "securePassword123" })
        expect(res.statusCode).toBe(200)
        expect(res.body.success).toBe(true)
    })
    it("should return 400 for missing password", async () => {
        const res = await request(server)
            .post("/login")
            .send({ email: "user@example.com" })
        expect(res.statusCode).toBe(400)
        expect(res.body.error).toBe("Email and password are required")
    })
    it("should return 400 for invalid credentials", async () => {
        const res = await request(server)
            .post("/login")
            .send({ email: "user@example.com", password: "wrongPassword" })
        expect(res.statusCode).toBe(400)
        expect(res.body.error).toBe("Invalid credentials")
    })
    it("should return 404 after 5 invalid attempts", async () => {
        for (let i = 0; i < 5; i++) {
            await request(server)
                .post("/login")
                .send({ email: "user@example.com", password: "wrongPassword" })
        }
        const res = await request(server)
            .post("/login")
            .send({ email: "user@example.com", password: "wrongPassword" })
        expect(res.statusCode).toBe(404)
        expect(res.body.error).toBe("Too many login attempts. Try again later.")
    })
    it("should allow login after 60 seconds wait", async () => {
        for (let i = 0; i < 5; i++) {
            await request(server)
                .post("/login")
                .send({ email: "user@example.com", password: "wrongPassword" })
        }
        await new Promise(resolve => setTimeout(resolve, 60000))
        const res = await request(server)
            .post("/login")
            .send({ email: "user@example.com", password: "securePassword123" })
        expect(res.statusCode).toBe(200)
        expect(res.body.success).toBe(true)
    })
})
