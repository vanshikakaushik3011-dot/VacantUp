import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../app';

describe('VacantUp Healthcare API Integration Tests', () => {
  let patientToken = '';
  let doctorToken = '';
  let adminToken = '';
  let testDoctorId = '';
  let testHospitalId = '';

  it('GET /health - should return healthy status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.name).toBe('VacantUp Healthcare API');
  });

  describe('Authentication Endpoints', () => {
    it('POST /api/auth/login - should authenticate patient with valid credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'patient@vacantup.com',
        password: 'Patient@123',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.role).toBe('PATIENT');
      patientToken = res.body.data.token;
    });

    it('POST /api/auth/login - should fail with wrong password', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'patient@vacantup.com',
        password: 'WrongPassword',
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/auth/login - should authenticate platform admin', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'admin@vacantup.com',
        password: 'Admin@123',
      });

      expect(res.status).toBe(200);
      expect(res.body.data.user.role).toBe('PLATFORM_ADMIN');
      adminToken = res.body.data.token;
    });

    it('GET /api/auth/me - should return logged in user info with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${patientToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe('patient@vacantup.com');
    });

    it('POST /api/auth/register - should register a new patient user', async () => {
      const uniqueEmail = `test.user.${Date.now()}@example.com`;
      const res = await request(app).post('/api/auth/register').send({
        name: 'Simran Kaur',
        email: uniqueEmail,
        password: 'Password@123',
        role: 'PATIENT',
        phone: '+91 98888 77777',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(uniqueEmail);
      expect(res.body.data.token).toBeDefined();
    });
  });

  describe('Doctor & Hospital Directory Endpoints', () => {
    it('GET /api/doctors - should return doctors list with availability and specialties', async () => {
      const res = await request(app).get('/api/doctors');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);

      const firstDoctor = res.body.data[0];
      testDoctorId = firstDoctor.id;
      expect(firstDoctor.name).toBeDefined();
      expect(firstDoctor.specialty).toBeDefined();
      expect(firstDoctor.availabilityStatus).toBeDefined();
    });

    it('GET /api/doctors?city=Karnal - should filter doctors in Karnal', async () => {
      const res = await request(app).get('/api/doctors?city=Karnal');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      res.body.data.forEach((doc: any) => {
        const docCityMatch = doc.city.toLowerCase() === 'karnal';
        const hospCityMatch = doc.hospitals.some((h: any) => h.city.toLowerCase() === 'karnal');
        expect(docCityMatch || hospCityMatch).toBe(true);
      });
    });

    it('GET /api/doctors?specialty=dermatology - should filter dermatologists', async () => {
      const res = await request(app).get('/api/doctors?specialty=dermatology');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].specialty.toLowerCase()).toContain('dermatology');
    });

    it('GET /api/doctors/:id - should return detailed doctor profile', async () => {
      const res = await request(app).get(`/api/doctors/${testDoctorId}`);
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(testDoctorId);
      expect(res.body.data.qualifications).toBeDefined();
      expect(res.body.data.hospitals.length).toBeGreaterThan(0);
      testHospitalId = res.body.data.hospitals[0].id;
    });

    it('GET /api/doctors/:id/availability - should calculate real slots for a future date', async () => {
      // Pick next Wednesday
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 3);
      const dateStr = futureDate.toISOString().split('T')[0];

      const res = await request(app).get(`/api/doctors/${testDoctorId}/availability?date=${dateStr}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.date).toBe(dateStr);
      expect(res.body.data.status).toBeDefined();
      expect(Array.isArray(res.body.data.slots)).toBe(true);
    });

    it('GET /api/hospitals - should return hospital directory with departments', async () => {
      const res = await request(app).get('/api/hospitals');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].city).toBeDefined();
    });

    it('GET /api/meta/cities & /api/meta/specialties - should return metadata', async () => {
      const resCities = await request(app).get('/api/meta/cities');
      expect(resCities.status).toBe(200);
      expect(resCities.body.data.length).toBeGreaterThan(0);

      const resSpecs = await request(app).get('/api/meta/specialties');
      expect(resSpecs.status).toBe(200);
      expect(resSpecs.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('Appointment Booking & Lifecycle', () => {
    let bookedAppointmentId = '';
    let bookingReference = '';
    const bookingDate = new Date();
    bookingDate.setDate(bookingDate.getDate() + 4);
    const bookingDateStr = bookingDate.toISOString().split('T')[0];

    it('POST /api/appointments - should book an appointment and return reference', async () => {
      const res = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({
          doctorId: testDoctorId,
          hospitalId: testHospitalId,
          appointmentDate: bookingDateStr,
          appointmentTime: '11:20 AM',
          notes: 'Routine skin checkup',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.bookingReference).toMatch(/^VAC-\d{4}-[A-Z0-9]+$/);
      expect(res.body.data.status).toBe('CONFIRMED');
      bookedAppointmentId = res.body.data.id;
      bookingReference = res.body.data.bookingReference;
    });

    it('POST /api/appointments - should PREVENT duplicate booking for the exact same slot', async () => {
      const res = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({
          doctorId: testDoctorId,
          hospitalId: testHospitalId,
          appointmentDate: bookingDateStr,
          appointmentTime: '11:20 AM',
          notes: 'Attempting conflicting booking',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('no longer available');
    });

    it('POST /api/appointments - should reject appointments in the past', async () => {
      const res = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({
          doctorId: testDoctorId,
          hospitalId: testHospitalId,
          appointmentDate: '2020-01-01',
          appointmentTime: '10:00 AM',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('past');
    });

    it('GET /api/appointments/my - should list patient appointments', async () => {
      const res = await request(app)
        .get('/api/appointments/my')
        .set('Authorization', `Bearer ${patientToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.some((a: any) => a.id === bookedAppointmentId)).toBe(true);
    });

    it('POST /api/appointments/:id/cancel - should cancel appointment', async () => {
      const res = await request(app)
        .post(`/api/appointments/${bookedAppointmentId}/cancel`)
        .set('Authorization', `Bearer ${patientToken}`)
        .send({ reason: 'Personal conflict' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('CANCELLED');
    });

    it('GET /api/notifications - should return notifications for patient', async () => {
      const res = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${patientToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.notifications.length).toBeGreaterThan(0);
    });
  });

  describe('Platform Admin Endpoints', () => {
    it('GET /api/admin/stats - should return platform statistics', async () => {
      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.totalUsers).toBeGreaterThan(0);
      expect(res.body.data.totalDoctors).toBeGreaterThan(0);
      expect(res.body.data.totalHospitals).toBeGreaterThan(0);
    });

    it('GET /api/admin/stats - should forbid non-admin users', async () => {
      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${patientToken}`);

      expect(res.status).toBe(403);
    });
  });
});
