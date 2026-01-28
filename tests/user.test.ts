import request from "supertest";
import mongoose from "mongoose";
import { app } from "../src/app";
import User from "../src/app/modules/user/user.model";
import envVariables from "../src/app/config/env";
import { UserRole } from "../src/app/modules/user/user.interface";

describe("User Service Integration Tests", () => {
  beforeAll(async () => {
    jest.setTimeout(30000);
    await mongoose.connect(envVariables.MONGO_URI);
  });

  afterAll(async () => {
    try {
      await User.deleteMany({});
    } finally {
      await mongoose.connection.close();
    }
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  const userData = {
    firstName: "Test",
    lastName: "User",
    email: "test.user@example.com",
    password: "Password123!",
  };

  const adminData = {
    firstName: "Admin",
    lastName: "User",
    email: "admin.user@example.com",
    password: "Password123!",
  };

  const createUserAndLogin = async (data: typeof userData, role: UserRole = UserRole.USER) => {
    // 1. Create User
    await request(app).post("/api/v1/user/create").send(data);

    // 2. Update role if needed (since API defaults to USER)
    if (role !== UserRole.USER) {
      await User.updateOne({ email: data.email }, { role });
    }

    // 3. Login
    const loginResponse = await request(app).post("/api/v1/auth/login").send({
      email: data.email,
      password: data.password,
    });
    return {
      token: loginResponse.body.data.accessToken,
      user: await User.findOne({ email: data.email }),
    };
  };

  describe("GET /api/v1/user/me", () => {
    it("should return the current user profile", async () => {
      const { token, user } = await createUserAndLogin(userData);

      const response = await request(app).get("/api/v1/user/me").set("Authorization", `${token}`); // or Bearer based on middleware

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(userData.email);
      expect(response.body.data._id).toBe(user?._id.toString());
    });

    it("should return 401 if not authenticated", async () => {
      const response = await request(app).get("/api/v1/user/me");
      expect(response.status).toBe(401);
    });
  });

  describe("PATCH /api/v1/user/:userId", () => {
    it("should successfully update user profile", async () => {
      const { token, user } = await createUserAndLogin(userData);
      const updateData = {
        firstName: "Updated",
        lastName: "Name",
      };

      const response = await request(app)
        .patch(`/api/v1/user/${user?._id}`)
        .set("Authorization", `${token}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.firstName).toBe(updateData.firstName);
      expect(response.body.data.lastName).toBe(updateData.lastName);

      const updatedUser = await User.findById(user?._id);
      expect(updatedUser?.firstName).toBe(updateData.firstName);
    });
  });

  describe("GET /api/v1/user/get-all", () => {
    it("should allow admin to get all users", async () => {
      // Create regular user
      await request(app).post("/api/v1/user/create").send(userData);

      // Create and login admin
      const { token: adminToken } = await createUserAndLogin(adminData, UserRole.ADMIN);

      const response = await request(app).get("/api/v1/user/get-all").set("Authorization", `${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2); // Admin + User
    });

    it("should deny access to regular users", async () => {
      const { token } = await createUserAndLogin(userData);

      const response = await request(app).get("/api/v1/user/get-all").set("Authorization", `${token}`);

      expect(response.status).toBe(403);
    });
  });

  describe("GET /api/v1/user/:userId", () => {
    it("should allow admin to get any user by ID", async () => {
      // Create target user
      await request(app).post("/api/v1/user/create").send(userData);
      const targetUser = await User.findOne({ email: userData.email });

      // Create admin
      const { token: adminToken } = await createUserAndLogin(adminData, UserRole.ADMIN);

      const response = await request(app).get(`/api/v1/user/${targetUser?._id}`).set("Authorization", `${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.email).toBe(userData.email);
    });
  });
});
