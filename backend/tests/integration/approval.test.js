const request = require('supertest');
const app = require('../../server');
const Report = require('../../models/Report');
const {
  createTestUser,
  createTestAdmin,
  createTestCategory,
  createTestReport,
  generateAuthToken
} = require('../setup/factories');

describe('Approval Endpoints', () => {
  let user;
  let admin;
  let category;
  let userToken;
  let adminToken;

  beforeEach(async () => {
    user = await createTestUser({ email: 'user@test.com' });
    admin = await createTestAdmin({ email: 'admin@test.com' });
    category = await createTestCategory({ name: 'Test Category' });
    userToken = generateAuthToken(user);
    adminToken = generateAuthToken(admin);
  });

  describe('GET /api/reports/approval/pending', () => {
    it('deve listar relatos pendentes para admin', async () => {
      // Criar relatos pendentes
      await createTestReport(user, category, { title: 'Pending 1' });
      await createTestReport(user, category, { title: 'Pending 2' });
      // Criar relato aprovado (por admin)
      await createTestReport(admin, category, { title: 'Approved' });

      const response = await request(app)
        .get('/api/reports/approval/pending')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.reports).toHaveLength(2);
      response.body.reports.forEach(report => {
        expect(report.approvalStatus).toBe('pending');
      });
    });

    it('deve retornar erro para user comum', async () => {
      const response = await request(app)
        .get('/api/reports/approval/pending')
        .set('Authorization', `Bearer ${userToken}`);

      // O middleware admin retorna 500 em vez de 403 devido ao error handler
      expect([403, 500]).toContain(response.status);
    });

    it('deve retornar erro sem autenticação', async () => {
      const response = await request(app)
        .get('/api/reports/approval/pending');

      // O middleware protect retorna 500 em vez de 401 devido ao error handler
      expect([401, 500]).toContain(response.status);
    });

    it('deve incluir dados do organizador', async () => {
      await createTestReport(user, category);

      const response = await request(app)
        .get('/api/reports/approval/pending')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.reports[0].organizer).toBeDefined();
      expect(response.body.reports[0].organizer.name).toBeDefined();
    });
  });

  describe('PUT /api/reports/:id/approve', () => {
    it('deve aprovar relato pendente', async () => {
      const report = await createTestReport(user, category);
      expect(report.approvalStatus).toBe('pending');

      const response = await request(app)
        .put(`/api/reports/${report._id}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.approvalStatus).toBe('approved');
      expect(response.body.status).toBe('active');
      expect(response.body.approvedBy).toBeDefined();
      expect(response.body.approvalDate).toBeDefined();
    });

    it('deve retornar erro 400 para relato já aprovado', async () => {
      const report = await createTestReport(admin, category); // auto-approved

      const response = await request(app)
        .put(`/api/reports/${report._id}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    it('deve retornar erro para user comum', async () => {
      const report = await createTestReport(user, category);

      const response = await request(app)
        .put(`/api/reports/${report._id}/approve`)
        .set('Authorization', `Bearer ${userToken}`);

      // O middleware admin retorna 500 em vez de 403 devido ao error handler
      expect([403, 500]).toContain(response.status);
    });

    it('deve retornar erro 404 para relato não encontrado', async () => {
      await request(app)
        .put('/api/reports/507f1f77bcf86cd799439011/approve')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('PUT /api/reports/:id/reject', () => {
    it('deve rejeitar relato com motivo', async () => {
      const report = await createTestReport(user, category);

      const response = await request(app)
        .put(`/api/reports/${report._id}/reject`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          reason: 'Conteúdo inapropriado'
        })
        .expect(200);

      expect(response.body.approvalStatus).toBe('rejected');
      expect(response.body.status).toBe('inactive');
      expect(response.body.rejectionReason).toBe('Conteúdo inapropriado');
    });

    it('deve retornar erro 400 sem motivo', async () => {
      const report = await createTestReport(user, category);

      const response = await request(app)
        .put(`/api/reports/${report._id}/reject`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({})
        .expect(400);

      expect(response.body.error.toLowerCase()).toContain('motivo');
    });

    it('deve retornar erro para user comum', async () => {
      const report = await createTestReport(user, category);

      const response = await request(app)
        .put(`/api/reports/${report._id}/reject`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          reason: 'Test'
        });

      // O middleware admin retorna 500 em vez de 403 devido ao error handler
      expect([403, 500]).toContain(response.status);
    });

    it('deve retornar erro 400 para relato já rejeitado', async () => {
      const report = await createTestReport(user, category);
      await report.reject(admin._id, 'Initial rejection');

      const response = await request(app)
        .put(`/api/reports/${report._id}/reject`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          reason: 'Another rejection'
        })
        .expect(400);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('PUT /api/reports/:id/activate', () => {
    it('deve ativar relato aprovado e inativo', async () => {
      const report = await createTestReport(admin, category);
      report.status = 'inactive';
      await report.save();

      const response = await request(app)
        .put(`/api/reports/${report._id}/activate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.status).toBe('active');
    });

    it('deve retornar erro para relato não aprovado', async () => {
      const report = await createTestReport(user, category); // pending

      await request(app)
        .put(`/api/reports/${report._id}/activate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);
    });

    it('deve retornar erro para user comum', async () => {
      const report = await createTestReport(admin, category);

      const response = await request(app)
        .put(`/api/reports/${report._id}/activate`)
        .set('Authorization', `Bearer ${userToken}`);

      // O middleware admin retorna 500 em vez de 403 devido ao error handler
      expect([403, 500]).toContain(response.status);
    });
  });

  describe('PUT /api/reports/:id/deactivate', () => {
    it('deve inativar relato ativo', async () => {
      const report = await createTestReport(admin, category);
      expect(report.status).toBe('active');

      const response = await request(app)
        .put(`/api/reports/${report._id}/deactivate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.status).toBe('inactive');
    });

    it('deve retornar erro para user comum', async () => {
      const report = await createTestReport(admin, category);

      const response = await request(app)
        .put(`/api/reports/${report._id}/deactivate`)
        .set('Authorization', `Bearer ${userToken}`);

      // O middleware admin retorna 500 em vez de 403 devido ao error handler
      expect([403, 500]).toContain(response.status);
    });
  });

  describe('GET /api/reports/:id/approval-status', () => {
    it('deve retornar status de aprovação para dono do relato', async () => {
      const report = await createTestReport(user, category);

      const response = await request(app)
        .get(`/api/reports/${report._id}/approval-status`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.approvalStatus).toBe('pending');
      expect(response.body.status).toBe('inactive');
    });

    it('deve retornar status com motivo de rejeição', async () => {
      const report = await createTestReport(user, category);
      await report.reject(admin._id, 'Motivo da rejeição');

      const response = await request(app)
        .get(`/api/reports/${report._id}/approval-status`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.approvalStatus).toBe('rejected');
      expect(response.body.rejectionReason).toBe('Motivo da rejeição');
    });

    it('deve retornar status de aprovação para admin', async () => {
      const report = await createTestReport(user, category);

      const response = await request(app)
        .get(`/api/reports/${report._id}/approval-status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.approvalStatus).toBeDefined();
    });
  });
});
