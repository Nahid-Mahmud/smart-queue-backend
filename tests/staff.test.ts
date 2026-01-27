import request from "supertest";
import mongoose from "mongoose";
import { app } from "../src/app";
import Staff from "../src/app/modules/staff/staff.model";
import User from "../src/app/modules/user/user.model";
import envVariables from "../src/app/config/env";

describe("Staff Integration Tests", () => {
  beforeAll(async () => {
    jest.setTimeout(30000);
    await mongoose.connect(envVariables.MONGO_URI);
  });

  afterAll(async () => {
    try {
      await Staff.deleteMany({});
      await User.deleteMany({});
    } finally {
      await mongoose.connection.close();
    }
  });

  beforeEach(async () => {
    await Staff.deleteMany({});
    await User.deleteMany({});
  });

  const userData = {
    firstName: "Staff",
    lastName: "Manager",
    email: "manager@example.com",
    password: "Password123!",
  };

  const staffData = {
    name: "Dr. Smith",
    serviceType: "Doctor",
    dailyCapacity: 5,
    availabilityStatus: "Available",
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

  describe("POST /api/v1/staff/create-staff", () => {
    it("should successfully create a new staff member", async () => {
      const { token } = await createUserAndLogin();

      const response = await request(app)
        .post("/api/v1/staff/create-staff")
        .set("Authorization", `${token}`)
        .send(staffData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(staffData.name);

      const savedStaff = await Staff.findOne({ name: staffData.name });
      expect(savedStaff).toBeTruthy();
    });

    it("should fail without proper payload", async () => {
      const { token } = await createUserAndLogin();
      // Validation schema requires certain fields
      const invalidData = { ...staffData, name: "" };

      const response = await request(app)
        .post("/api/v1/staff/create-staff")
        .set("Authorization", `${token}`)
        .send(invalidData);

      expect(response.status).toBe(400);
    });
  });

  describe("GET /api/v1/staff", () => {
    it("should return all staff members", async () => {
      const { token } = await createUserAndLogin();
      // Need to simulate staff creation with addedBy
      const user = await User.findOne({ email: userData.email });
      await Staff.create({ ...staffData, addedBy: user?._id });

      const response = await request(app).get("/api/v1/staff").set("Authorization", `${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
    });
  });

  describe("PATCH /api/v1/staff/:id", () => {
    it("should update staff details", async () => {
      const { token } = await createUserAndLogin();
      const user = await User.findOne({ email: userData.email });
      const staff = await Staff.create({ ...staffData, addedBy: user?._id });

      const updateData = { availabilityStatus: "On Leave" };

      const response = await request(app)
        .patch(`/api/v1/staff/${staff._id}`)
        .set("Authorization", `${token}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.availabilityStatus).toBe("On Leave");
    });
  });

  describe("DELETE /api/v1/staff/:id", () => {
    it("should soft delete staff", async () => {
      const { token } = await createUserAndLogin();
      const user = await User.findOne({ email: userData.email });
      const staff = await Staff.create({ ...staffData, addedBy: user?._id });

      const response = await request(app).delete(`/api/v1/staff/${staff._id}`).set("Authorization", `${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const deletedStaff = await Staff.findById(staff._id);
      expect(deletedStaff?.isDeleted).toBe(true);
    });
  });
});
