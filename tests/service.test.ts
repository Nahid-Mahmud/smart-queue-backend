import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../src/app';
import envVariables from '../src/app/config/env';
import Service from '../src/app/modules/service/service.model';

describe('Service (Offering) Integration Tests', () => {
  beforeAll(async () => {
    jest.setTimeout(30000);
    await mongoose.connect(envVariables.MONGO_URI);
  });

  afterAll(async () => {
    try {
      await Service.deleteMany({});
    } finally {
      await mongoose.connection.close();
    }
  });

  beforeEach(async () => {
    await Service.deleteMany({});
  });

  const serviceData = {
    serviceName: 'General Consultation',
    duration: 30,
    requiredStaffType: 'Doctor',
  };

  describe('POST /api/v1/service/create-service', () => {
    it('should create a new service', async () => {
      const response = await request(app)
        .post('/api/v1/service/create-service')
        .send(serviceData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.serviceName).toBe(serviceData.serviceName);

      const service = await Service.findOne({
        serviceName: serviceData.serviceName,
      });
      expect(service).toBeTruthy();
    });

    it('should fail with invalid duration', async () => {
      const invalidData = { ...serviceData, duration: 45 }; // 45 is not in [15, 30, 60]
      const response = await request(app)
        .post('/api/v1/service/create-service')
        .send(invalidData);

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/v1/service', () => {
    it('should return all services', async () => {
      await Service.create(serviceData);
      const response = await request(app).get('/api/v1/service');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(1);
    });
  });

  describe('GET /api/v1/service/:id', () => {
    it('should return a single service', async () => {
      const service = await Service.create(serviceData);
      const response = await request(app).get(`/api/v1/service/${service._id}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(service._id.toString());
    });
  });

  describe('PATCH /api/v1/service/:id', () => {
    it('should update a service', async () => {
      const service = await Service.create(serviceData);
      const updateData = { serviceName: 'Updated Service' };

      const response = await request(app)
        .patch(`/api/v1/service/${service._id}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.serviceName).toBe(updateData.serviceName);
    });
  });

  describe('DELETE /api/v1/service/:id', () => {
    it('should soft delete a service', async () => {
      const service = await Service.create(serviceData);

      const response = await request(app).delete(
        `/api/v1/service/${service._id}`
      );

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      // Assuming logic sets isDeleted: true instead of hard delete, based on common patterns and schema having isDeleted
      const deletedService = await Service.findById(service._id);
      expect(deletedService?.isDeleted).toBe(true);
    });
  });
});
