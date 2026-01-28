import mongoose from "mongoose";
import request from "supertest";
import { app } from "../src/app";
import envVariables from "../src/app/config/env";
import User from "../src/app/modules/user/user.model";

describe("Authentication Integration Tests", () => {
  beforeAll(async () => {
    jest.setTimeout(30000); // Increase global timeout
    // Connect to the test database
    await mongoose.connect(envVariables.MONGO_URI);
    // eslint-disable-next-line no-console
    console.log("Connected to MongoDB");
  }, 30000);

  afterAll(async () => {
    // Clean up and disconnect
    try {
      await User.deleteMany({});
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error clearing users:", error);
    } finally {
      await mongoose.connection.close();
    }
  });

  beforeEach(async () => {
    // Clear users before each test to ensure isolation
    await User.deleteMany({});
  });

  afterEach(async () => {
    // Clear users after each test to ensure clean state
    await User.deleteMany({});
  });

  const userData = {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    password: "Password123!",
  };

  describe("POST /api/v1/user/create (Signup)", () => {
    it("should successfully create a new user", async () => {
      const response = await request(app).post("/api/v1/user/create").send(userData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("email", userData.email);
      expect(response.body.data).not.toHaveProperty("password"); // Password should not be returned

      // Verify user in database
      const user = await User.findOne({ email: userData.email });
      expect(user).toBeTruthy();
      expect(user?.firstName).toBe(userData.firstName);
    });

    it("should fail when required fields are missing", async () => {
      // Use Partial<typeof userData> to avoid 'any'
      const invalidData: Partial<typeof userData> = { ...userData };
      delete invalidData.email;

      const response = await request(app).post("/api/v1/user/create").send(invalidData);

      // Expecting 400 or appropriate error code for validation failure
      expect(response.status).not.toBe(200);
    });

    it("should fail when registering with an existing email", async () => {
      // First registration
      await request(app).post("/api/v1/user/create").send(userData);

      // Second registration with same email
      const response = await request(app).post("/api/v1/user/create").send(userData);

      expect(response.status).toBe(409); // Conflict for duplicate email
      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/v1/auth/login (Login)", () => {
    beforeEach(async () => {
      // Create a user for login tests
      await request(app).post("/api/v1/user/create").send(userData);
    });

    it("should successfully login with valid credentials", async () => {
      const response = await request(app).post("/api/v1/auth/login").send({
        email: userData.email,
        password: userData.password,
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("accessToken");
    });

    it("should fail validation with invalid email format", async () => {
      const response = await request(app).post("/api/v1/auth/login").send({
        email: "not-an-email",
        password: userData.password,
      });

      expect(response.status).toBe(400);
    });

    it("should fail with incorrect password", async () => {
      const response = await request(app).post("/api/v1/auth/login").send({
        email: userData.email,
        password: "WrongPassword123!",
      });

      expect(response.status).toBe(401); // Unauthorized or 400 depending on implementation
      expect(response.body.success).toBe(false);
    });

    it("should fail with non-existent email", async () => {
      const response = await request(app).post("/api/v1/auth/login").send({
        email: "nonexistent@example.com",
        password: "Password123!",
      });

      expect(response.status).toBe(401); // Generic Unauthorized for security
      expect(response.body.success).toBe(false);
    });
  });

  describe("Multiple Accounts Interaction", () => {
    const user1 = {
      firstName: "User",
      lastName: "One",
      email: "user1@example.com",
      password: "Password1!",
    };

    const user2 = {
      firstName: "User",
      lastName: "Two",
      email: "user2@example.com",
      password: "Password2!",
    };

    it("should allow multiple distinct users to register and login", async () => {
      // Register user 1
      const regResponse1 = await request(app).post("/api/v1/user/create").send(user1);
      expect(regResponse1.status).toBe(201);

      // Register user 2
      const regResponse2 = await request(app).post("/api/v1/user/create").send(user2);
      expect(regResponse2.status).toBe(201);

      // Login user 1
      const loginResponse1 = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: user1.email, password: user1.password });
      expect(loginResponse1.status).toBe(200);
      expect(loginResponse1.body.data.accessToken).toBeDefined();

      // Login user 2
      const loginResponse2 = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: user2.email, password: user2.password });
      expect(loginResponse2.status).toBe(200);
      expect(loginResponse2.body.data.accessToken).toBeDefined();

      // Verify tokens are different (implicitly they should be, but just to be sure)
      expect(loginResponse1.body.data.accessToken).not.toBe(loginResponse2.body.data.accessToken);
    });
  });
});
