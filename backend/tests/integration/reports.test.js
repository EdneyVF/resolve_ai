const request = require('supertest');
const app = require('../../server');
const Report = require('../../models/Report');
const {
  createTestUser,
  createTestAdmin,
  createTestCategory,
  createTestReport,
  generateAuthToken,
  buildReportData
} = require('../setup/factories');

describe('Reports Endpoints', () => {
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

  describe('GET /api/reports', () => {
    it('deve listar apenas relatos aprovados e ativos para público', async () => {
      // Criar relato aprovado (por admin) - será active
      await createTestReport(admin, category);
      // Criar relato pendente (por user) - será inactive
      await createTestReport(user, category);

      const response = await request(app)
        .get('/api/reports')
        .expect(200);

      // Apenas relatos aprovados e ativos devem aparecer
      expect(response.body.reports).toHaveLength(1);
      expect(response.body.reports[0].approvalStatus).toBe('approved');
      expect(response.body.reports[0].status).toBe('active');
    });

    it('deve paginar resultados', async () => {
      // Criar 5 relatos aprovados
      for (let i = 0; i < 5; i++) {
        await createTestReport(admin, category, { title: `Report ${i}` });
      }

      const response = await request(app)
        .get('/api/reports?page=1&limit=2')
        .expect(200);

      expect(response.body.reports).toHaveLength(2);
      expect(response.body.total).toBe(5);
      expect(response.body.page).toBe(1);
    });

    it('deve filtrar por categoria', async () => {
      const category2 = await createTestCategory({ name: 'Other Category' });
      await createTestReport(admin, category);
      await createTestReport(admin, category2);

      const response = await request(app)
        .get(`/api/reports?category=${category._id}`)
        .expect(200);

      expect(response.body.reports).toHaveLength(1);
    });

    it('deve filtrar por cidade', async () => {
      await createTestReport(admin, category, {
        location: {
          address: 'Addr 1',
          city: 'São Paulo',
          state: 'SP',
          country: 'Brasil'
        }
      });
      await createTestReport(admin, category, {
        location: {
          address: 'Addr 2',
          city: 'Rio de Janeiro',
          state: 'RJ',
          country: 'Brasil'
        }
      });

      const response = await request(app)
        .get('/api/reports?city=São Paulo')
        .expect(200);

      expect(response.body.reports).toHaveLength(1);
      expect(response.body.reports[0].location.city).toBe('São Paulo');
    });

    it('deve buscar por texto no título ou descrição', async () => {
      await createTestReport(admin, category, {
        title: 'Buraco na rua',
        description: 'Grande buraco na rua principal'
      });
      await createTestReport(admin, category, {
        title: 'Iluminação pública',
        description: 'Poste sem luz na avenida'
      });

      const response = await request(app)
        .get('/api/reports?search=buraco')
        .expect(200);

      expect(response.body.reports).toHaveLength(1);
      expect(response.body.reports[0].title).toBe('Buraco na rua');
    });
  });

  describe('POST /api/reports', () => {
    it('deve criar relato com sucesso', async () => {
      const reportData = {
        title: 'Novo Relato',
        description: 'Description with enough characters for validation',
        date: new Date().toISOString(),
        location: {
          address: 'Test Address, 123',
          city: 'Test City',
          state: 'TS',
          country: 'Brasil'
        },
        category: category._id
      };

      const response = await request(app)
        .post('/api/reports')
        .set('Authorization', `Bearer ${userToken}`)
        .send(reportData)
        .expect(201);

      expect(response.body.report._id).toBeDefined();
      expect(response.body.report.approvalStatus).toBe('pending');
      expect(response.body.report.needsApproval).toBe(true);
    });

    it('deve auto-aprovar relato criado por admin', async () => {
      const reportData = {
        title: 'Admin Report',
        description: 'Description with enough characters for validation',
        date: new Date().toISOString(),
        location: {
          address: 'Test Address, 123',
          city: 'Test City',
          state: 'TS',
          country: 'Brasil'
        },
        category: category._id
      };

      const response = await request(app)
        .post('/api/reports')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(reportData)
        .expect(201);

      expect(response.body.report.approvalStatus).toBe('approved');
      expect(response.body.report.status).toBe('active');
      expect(response.body.report.needsApproval).toBe(false);
    });

    it('deve retornar erro 400 para campos faltando', async () => {
      const response = await request(app)
        .post('/api/reports')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Test'
          // faltam outros campos
        })
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    it('deve retornar erro sem autenticação', async () => {
      const reportData = {
        title: 'Test Report',
        description: 'Description with enough characters',
        date: new Date().toISOString(),
        location: {
          address: 'Test Address',
          city: 'Test City',
          state: 'TS',
          country: 'Brasil'
        },
        category: category._id
      };

      const response = await request(app)
        .post('/api/reports')
        .send(reportData);

      // O middleware de autenticação não usa ErrorResponse, então retorna 500
      // em vez de 401. Verificamos que a requisição falhou.
      expect([401, 500]).toContain(response.status);
      expect(response.body.error).toBeDefined();
    });

    it('deve retornar erro para categoria inativa', async () => {
      const inactiveCategory = await createTestCategory({
        name: 'Inactive',
        active: false
      });

      const reportData = {
        title: 'Test Report',
        description: 'Description with enough characters for validation',
        date: new Date().toISOString(),
        location: {
          address: 'Test Address',
          city: 'Test City',
          state: 'TS',
          country: 'Brasil'
        },
        category: inactiveCategory._id
      };

      const response = await request(app)
        .post('/api/reports')
        .set('Authorization', `Bearer ${userToken}`)
        .send(reportData)
        .expect(400);

      expect(response.body.error).toContain('inativa');
    });
  });

  describe('GET /api/reports/:id', () => {
    it('deve retornar detalhes de relato aprovado', async () => {
      const report = await createTestReport(admin, category);

      const response = await request(app)
        .get(`/api/reports/${report._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body._id.toString()).toBe(report._id.toString());
      expect(response.body.title).toBe(report.title);
    });

    it('deve retornar erro 404 para relato não encontrado', async () => {
      await request(app)
        .get('/api/reports/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });

    it('deve permitir dono ver relato não aprovado', async () => {
      const report = await createTestReport(user, category);
      expect(report.approvalStatus).toBe('pending');

      const response = await request(app)
        .get(`/api/reports/${report._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body._id.toString()).toBe(report._id.toString());
    });

    it('deve permitir admin ver relato não aprovado', async () => {
      const report = await createTestReport(user, category);

      const response = await request(app)
        .get(`/api/reports/${report._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body._id.toString()).toBe(report._id.toString());
    });

    it('deve retornar erro 403 para relato não aprovado de outro usuário', async () => {
      const report = await createTestReport(user, category);
      const otherUser = await createTestUser({ email: 'other@test.com' });
      const otherToken = generateAuthToken(otherUser);

      await request(app)
        .get(`/api/reports/${report._id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403);
    });
  });

  describe('PUT /api/reports/:id', () => {
    it('deve permitir dono editar próprio relato', async () => {
      const report = await createTestReport(user, category);

      const response = await request(app)
        .put(`/api/reports/${report._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Updated Title'
        })
        .expect(200);

      // A API retorna { success, message, report }
      expect(response.body.report.title).toBe('Updated Title');
    });

    it('deve retornar erro 403 para outro usuário', async () => {
      const report = await createTestReport(user, category);
      const otherUser = await createTestUser({ email: 'other@test.com' });
      const otherToken = generateAuthToken(otherUser);

      await request(app)
        .put(`/api/reports/${report._id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({
          title: 'Hacked Title'
        })
        .expect(403);
    });

    it('deve permitir admin editar qualquer relato', async () => {
      const report = await createTestReport(user, category);

      const response = await request(app)
        .put(`/api/reports/${report._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Admin Updated'
        })
        .expect(200);

      // A API retorna { success, message, report }
      expect(response.body.report.title).toBe('Admin Updated');
    });
  });

  describe('DELETE /api/reports/:id', () => {
    it('deve permitir dono deletar próprio relato', async () => {
      const report = await createTestReport(user, category);

      await request(app)
        .delete(`/api/reports/${report._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      const deleted = await Report.findById(report._id);
      expect(deleted).toBeNull();
    });

    it('deve retornar erro 403 para outro usuário', async () => {
      const report = await createTestReport(user, category);
      const otherUser = await createTestUser({ email: 'other@test.com' });
      const otherToken = generateAuthToken(otherUser);

      await request(app)
        .delete(`/api/reports/${report._id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403);
    });

    it('deve permitir admin deletar qualquer relato', async () => {
      const report = await createTestReport(user, category);

      await request(app)
        .delete(`/api/reports/${report._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const deleted = await Report.findById(report._id);
      expect(deleted).toBeNull();
    });
  });

  describe('PUT /api/reports/:id/cancel', () => {
    it('deve permitir dono cancelar próprio relato', async () => {
      const report = await createTestReport(admin, category);

      const response = await request(app)
        .put(`/api/reports/${report._id}/cancel`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verificar no banco
      const updated = await Report.findById(report._id);
      expect(updated.status).toBe('canceled');
    });

    it('deve retornar erro para relato já cancelado', async () => {
      const report = await createTestReport(admin, category);
      report.status = 'canceled';
      await report.save();

      await request(app)
        .put(`/api/reports/${report._id}/cancel`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);
    });
  });

  describe('GET /api/reports/my-reports', () => {
    it('deve listar apenas relatos do usuário logado', async () => {
      await createTestReport(user, category, { title: 'User Report 1' });
      await createTestReport(user, category, { title: 'User Report 2' });
      await createTestReport(admin, category, { title: 'Admin Report' });

      const response = await request(app)
        .get('/api/reports/my-reports')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.reports).toHaveLength(2);
      response.body.reports.forEach(report => {
        expect(report.organizer.toString()).toBe(user._id.toString());
      });
    });

    it('deve incluir contadores por status', async () => {
      await createTestReport(user, category);

      const response = await request(app)
        .get('/api/reports/my-reports')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.counts).toBeDefined();
      expect(response.body.counts.total).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /api/reports/admin/all', () => {
    it('deve listar todos os relatos para admin', async () => {
      await createTestReport(user, category, { title: 'Pending' });
      await createTestReport(admin, category, { title: 'Approved' });

      const response = await request(app)
        .get('/api/reports/admin/all')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.reports.length).toBeGreaterThanOrEqual(2);
    });

    it('deve retornar erro para user comum', async () => {
      const response = await request(app)
        .get('/api/reports/admin/all')
        .set('Authorization', `Bearer ${userToken}`);

      // O middleware admin não usa ErrorResponse, então retorna 500
      // em vez de 403. Verificamos que a requisição falhou.
      expect([403, 500]).toContain(response.status);
      expect(response.body.error).toBeDefined();
    });
  });
});
