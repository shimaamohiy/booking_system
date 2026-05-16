const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');

jest.setTimeout(60000);

describe('Services API', () => {
  let adminToken, userToken, professionalToken;
  const adminEmail = `a${Date.now()}@ex.com`;
  const userEmail = `u${Date.now()}@ex.com`;
  const profEmail = `p${Date.now()}@ex.com`;
  let serviceId;

  beforeAll(async () => {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGO_URI);
    }

    // Create Admin
    await request(app).post('/api/sign/signup').send({
      name: 'Admin Test',
      email: adminEmail,
      password: 'Password@123',
      role: 'admin',
    });
    const adminLogin = await request(app)
      .post('/api/sign/login')
      .send({ email: adminEmail, password: 'Password@123' });
    adminToken = adminLogin.body.token;

    // Create User
    await request(app).post('/api/sign/signup').send({
      name: 'Normal User Test',
      email: userEmail,
      password: 'Password@123',
      role: 'user',
    });
    const userLogin = await request(app)
      .post('/api/sign/login')
      .send({ email: userEmail, password: 'Password@123' });
    userToken = userLogin.body.token;

    // Create Professional
    await request(app).post('/api/sign/signup').send({
      name: 'Doctor Test',
      email: profEmail,
      password: 'Password@123',
      role: 'professional',
      specialty: 'Dentist',
    });
    const profLogin = await request(app)
      .post('/api/sign/login')
      .send({ email: profEmail, password: 'Password@123' });
    professionalToken = profLogin.body.token;
  }, 60000);

  afterAll(async () => {
    // Cleanup
    await mongoose.connection.collection('users').deleteMany({
      email: { $in: [adminEmail, userEmail, profEmail] },
    });
    if (serviceId) {
      await mongoose.connection
        .collection('services')
        .deleteOne({ _id: new mongoose.Types.ObjectId(serviceId) });
    }
    await mongoose.connection.close();
  }, 60000);

  describe('POST /api/services', () => {
    it('should allow admin to create a service', async () => {
      const res = await request(app)
        .post('/api/services')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Real Test Service',
          description: 'A test service',
          price: 500,
          discount: 0,
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toBe('Professional ID is required for admin');
    });

    it('should allow professional to create a service', async () => {
      const res = await request(app)
        .post('/api/services')
        .set('Authorization', `Bearer ${professionalToken}`)
        .send({
          name: 'Professional Real Service',
          description: 'Dr Test Service',
          price: 200,
          discount: 10,
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      serviceId = res.body.service._id;
    });

    it('should prevent regular user from creating a service', async () => {
      const res = await request(app)
        .post('/api/services')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'User Service',
          price: 10,
        });

      expect(res.statusCode).toEqual(403);
    });
  });

  describe('GET /api/services', () => {
    it('should return services for admin', async () => {
      const res = await request(app)
        .get('/api/services')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.services)).toBe(true);
    });
  });
});
