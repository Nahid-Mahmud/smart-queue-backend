import mongoose from "mongoose";
import request from "supertest";
import { app } from "../src/app";
import envVariables from "../src/app/config/env";
import ActivityLog from "../src/app/modules/activityLog/activityLog.model";
import User from "../src/app/modules/user/user.model";

describe("Activity Log Integration Tests", () => {
  beforeAll(async () => {
    jest.setTimeout(30000);
    await mongoose.connect(envVariables.MONGO_URI);
  });

  afterAll(async () => {
    try {
      await ActivityLog.deleteMany({});
      await User.deleteMany({});
    } finally {
      await mongoose.connection.close();
    }
  });

  beforeEach(async () => {
    await ActivityLog.deleteMany({});
    await User.deleteMany({});
  });

  const userData = {
    firstName: "Log",
    lastName: "Viewer",
    email: "logs@example.com",
    password: "Password123!",
  };

  const createUserAndLogin = async () => {
    await request(app).post("/api/v1/user/create").send(userData);
    const loginResponse = await request(app).post("/api/v1/auth/login").send({
      email: userData.email,
      password: userData.password,
    });
    return {
      token: loginResponse.body.data.accessToken,
    };
  };

  describe("GET /api/v1/activity-log", () => {
    it("should return activity logs", async () => {
      const { token } = await createUserAndLogin();

      await ActivityLog.create({
        action: "TEST_ACTION",
        details: "Test details",
      });

      const response = await request(app).get("/api/v1/activity-log").set("Authorization", `${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].action).toBe("TEST_ACTION");
    });
  });
});
