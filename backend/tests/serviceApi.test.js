const request = require("supertest");
const app = require("../app");
const prisma = require("../lib/prisma");

const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
const adminPassword = process.env.ADMIN_PASSWORD || "password123";

async function clearDatabase() {
  await prisma.service.deleteMany();
}

describe("Service API", () => {
  let adminToken;

  beforeAll(async () => {
    // Make sure DB is clean before tests
    await clearDatabase();

    // Get an admin token
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: adminEmail, password: adminPassword });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    adminToken = res.body.token;
  });

  afterAll(async () => {
    await clearDatabase();
    await prisma.$disconnect();
  });

  test("GET /api/services returns empty list when no services", async () => {
    const res = await request(app).get("/api/services");

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("data");
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(0);
    expect(res.body).toHaveProperty("total", 0);
  });

  test("POST /api/services creates a service when admin token is provided", async () => {
    const payload = {
      name: "Test Health Centre",
      address: "100 Test St",
      city: "Toronto",
      category: "Health",
      phone: "416-555-0000",
      website: "https://test-centre.example.com",
      postalCode: "M5V 2T6",
      latitude: 43.65,
      longitude: -79.38,
    };

    const res = await request(app)
      .post("/api/services")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(payload);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.name).toBe(payload.name);

    // Verify it appears in the list
    const listRes = await request(app).get("/api/services");
    expect(listRes.statusCode).toBe(200);
    expect(listRes.body.total).toBe(1);
    expect(listRes.body.data[0].name).toBe(payload.name);
  });

  test("POST /api/services rejects invalid data with validation error", async () => {
    const badPayload = {
      name: "X", // too short
      address: "1", // too short
      city: "",
    };

    const res = await request(app)
      .post("/api/services")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(badPayload);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toMatch(/Validation failed|Invalid/);
  });

  test("POST /api/services without token is unauthorized", async () => {
    const payload = {
      name: "Unauthorized Centre",
      address: "123 Nowhere St",
      city: "Toronto",
    };

    const res = await request(app).post("/api/services").send(payload);

    expect(res.statusCode).toBe(401);
  });
});
