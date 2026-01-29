import mongoose from "mongoose";
import request from "supertest";
import { app } from "../src/app";
import envVariables from "../src/app/config/env";
import Appointment from "../src/app/modules/appointment/appointment.model";
import Service from "../src/app/modules/service/service.model";
import User from "../src/app/modules/user/user.model";

describe('Appointment Integration Tests', () => {
  beforeAll(async () => {
    jest.setTimeout(30000);
    await mongoose.connect(envVariables.MONGO_URI);
  });

  afterAll(async () => {
    try {
      await Appointment.deleteMany({});
      await Service.deleteMany({});
      await User.deleteMany({});
    } finally {
      await mongoose.connection.close();
    }
  });

  beforeEach(async () => {
    await Appointment.deleteMany({});
    await Service.deleteMany({});
    await User.deleteMany({});
  });

  const userData = {
    firstName: 'Test',
    lastName: 'User',
    email: 'test.appt@example.com',
    password: 'Password123!',
  };

  const serviceData = {
    serviceName: 'Dental Checkup',
    duration: 30,
    requiredStaffType: 'Dentist',
  };

  const createService = async () => {
    return await Service.create(serviceData);
  };

  const createUserAndLogin = async () => {
    await request(app).post('/api/v1/user/create').send(userData);
    const loginResponse = await request(app).post('/api/v1/auth/login').send({
      email: userData.email,
      password: userData.password,
    });
    return {
      token: loginResponse.body.data.accessToken,
      user: await User.findOne({ email: userData.email }),
    };
  };

  describe('POST /api/v1/appointment/create-appointment', () => {
    it('should successfully book an appointment', async () => {
      const { token } = await createUserAndLogin();
      const service = await createService();

      const appointmentData = {
        customerName: 'Jane Doe',
        service: service._id,
        appointmentDate: '2023-12-25',
        appointmentStartTime: '10:00',
      };

      const response = await request(app)
        .post('/api/v1/appointment/create-appointment')
        .set('Authorization', `${token}`)
        .send(appointmentData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.customerName).toBe(
        appointmentData.customerName
      );

      const savedAppt = await Appointment.findById(response.body.data._id);
      expect(savedAppt).toBeTruthy();
      expect(savedAppt?.createdBy).toBeDefined();
    });

    it('should fail without authentication', async () => {
      const service = await createService();
      const appointmentData = {
        customerName: 'Jane Doe',
        service: service._id,
        appointmentDate: '2023-12-25',
      };

      const response = await request(app)
        .post('/api/v1/appointment/create-appointment')
        .send(appointmentData);

      expect(response.status).toBe(401); // or 403
    });
  });

  describe('GET /api/v1/appointment', () => {
    it('should return appointments', async () => {
      const { token, user } = await createUserAndLogin();
      const service = await createService();

      await Appointment.create({
        customerName: 'John Smith',
        service: service._id,
        appointmentDate: '2023-12-26',
        createdBy: user?._id,
        status: 'Scheduled',
      });

      const response = await request(app)
        .get('/api/v1/appointment')
        .set('Authorization', `${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('PATCH /api/v1/appointment/:id', () => {
    it('should update appointment status', async () => {
      const { token, user } = await createUserAndLogin();
      const service = await createService();

      const appt = await Appointment.create({
        customerName: 'John Smith',
        service: service._id,
        appointmentDate: '2023-12-26',
        createdBy: user?._id,
        status: 'Scheduled',
      });

      const updateData = { status: 'Completed' };

      const response = await request(app)
        .patch(`/api/v1/appointment/${appt._id}`)
        .set('Authorization', `${token}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('Completed');
    });
  });
});
