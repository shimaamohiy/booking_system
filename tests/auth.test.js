const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');

jest.setTimeout(60000);

describe('Authentication API', () => {
  const uniqueEmail = `u${Date.now()}@ex.com`;
  const uniqueDocEmail = `d${Date.now()}@ex.com`;

  beforeAll(async () => {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGO_URI);
    }
  }, 60000);

  afterAll(async () => {
    // Delete the test users we created
    await mongoose.connection.collection('users').deleteMany({
      email: { $in: [uniqueEmail, uniqueDocEmail] },
    });
    await mongoose.connection.close();
  }, 60000);

  describe('POST /api/sign/signup', () => {
    it('should create a new user successfully', async () => {
      const res = await request(app).post('/api/sign/signup').send({
        name: 'Test User',
        email: uniqueEmail,
        password: 'Password@123',
        role: 'user',
      });

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
    });

    it('should create a professional successfully', async () => {
      const res = await request(app).post('/api/sign/signup').send({
        name: 'Test Doctor',
        email: uniqueDocEmail,
        password: 'Password@123',
        role: 'professional',
        specialty: 'Dentist',
      });

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
    });

    it('should fail if email already exists', async () => {
      const res = await request(app).post('/api/sign/signup').send({
        name: 'Test User Duplicate',
        email: uniqueEmail,
        password: 'Password@123',
        role: 'user',
      });

      expect(res.statusCode).toEqual(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('User Already exist!');
    });
  });

  describe('POST /api/sign/login', () => {
    it('should login successfully with correct credentials', async () => {
      const res = await request(app).post('/api/sign/login').send({
        email: uniqueEmail,
        password: 'Password@123',
      });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
    });

    it('should fail with incorrect password', async () => {
      const res = await request(app).post('/api/sign/login').send({
        email: uniqueEmail,
        password: 'Wrong@1234',
      });

      expect(res.statusCode).toEqual(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid Password!');
    });

    it('should fail if user does not exist', async () => {
      const res = await request(app).post('/api/sign/login').send({
        email: 'nonexistent@example.com',
        password: 'Password@123',
      });

      expect(res.statusCode).toEqual(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('User does not exist!');
    });
  });
});
