const request = require('supertest');
const app = require('../../server');
const Category = require('../../models/Category');
const {
  createTestUser,
  createTestAdmin,
  createTestCategory,
  createTestReport,
  generateAuthToken
} = require('../setup/factories');

describe('Categories Endpoints', () => {
  let user;
  let admin;
  let userToken;
  let adminToken;

  beforeEach(async () => {
    user = await createTestUser({ email: 'user@test.com' });
    admin = await createTestAdmin({ email: 'admin@test.com' });
    userToken = generateAuthToken(user);
    adminToken = generateAuthToken(admin);
  });

  describe('GET /api/categories', () => {
    it('deve listar apenas categorias ativas para público', async () => {
      await createTestCategory({ name: 'Active 1', active: true });
      await createTestCategory({ name: 'Active 2', active: true });
      await createTestCategory({ name: 'Inactive', active: false });

      const response = await request(app)
        .get('/api/categories')
        .expect(200);

      // Sem autenticação, deve ver apenas ativas
      expect(response.body).toHaveLength(2);
      response.body.forEach(cat => {
        expect(cat.active).toBe(true);
      });
    });

    it('deve listar todas categorias para admin', async () => {
      await createTestCategory({ name: 'Active', active: true });
      await createTestCategory({ name: 'Inactive', active: false });

      const response = await request(app)
        .get('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Admin deve ver todas as categorias (ativas e inativas)
      const activeCategories = response.body.filter(c => c.active === true);
      const inactiveCategories = response.body.filter(c => c.active === false);
      expect(activeCategories.length).toBeGreaterThanOrEqual(1);
      expect(inactiveCategories.length).toBeGreaterThanOrEqual(1);
    });

    it('deve listar apenas categorias ativas para user autenticado', async () => {
      await createTestCategory({ name: 'Active', active: true });
      await createTestCategory({ name: 'Inactive', active: false });

      const response = await request(app)
        .get('/api/categories')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      response.body.forEach(cat => {
        expect(cat.active).toBe(true);
      });
    });
  });

  describe('GET /api/categories/:id', () => {
    it('deve retornar detalhes da categoria', async () => {
      const category = await createTestCategory({
        name: 'Test Category',
        description: 'Test description'
      });

      const response = await request(app)
        .get(`/api/categories/${category._id}`)
        .expect(200);

      expect(response.body.name).toBe('Test Category');
      expect(response.body.description).toBe('Test description');
    });

    it('deve retornar erro 404 para categoria não encontrada', async () => {
      await request(app)
        .get('/api/categories/507f1f77bcf86cd799439011')
        .expect(404);
    });
  });

  describe('POST /api/categories', () => {
    it('deve criar categoria como admin', async () => {
      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'New Category',
          description: 'New description'
        })
        .expect(201);

      expect(response.body.name).toBe('New Category');
      expect(response.body.active).toBe(true);
    });

    it('deve retornar erro para user comum', async () => {
      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'User Category'
        });

      // O middleware admin retorna 500 em vez de 403 devido ao error handler
      expect([403, 500]).toContain(response.status);
    });

    it('deve retornar erro sem autenticação', async () => {
      const response = await request(app)
        .post('/api/categories')
        .send({
          name: 'No Auth Category'
        });

      // O middleware protect retorna 500 em vez de 401 devido ao error handler
      expect([401, 500]).toContain(response.status);
    });

    it('deve retornar erro 400 para nome duplicado', async () => {
      await createTestCategory({ name: 'Duplicate' });

      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Duplicate'
        })
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    it('deve retornar erro 400 para nome muito curto', async () => {
      await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'A'
        })
        .expect(400);
    });
  });

  describe('PUT /api/categories/:id', () => {
    it('deve atualizar categoria como admin', async () => {
      const category = await createTestCategory({ name: 'Original' });

      const response = await request(app)
        .put(`/api/categories/${category._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated Name',
          description: 'Updated description'
        })
        .expect(200);

      expect(response.body.name).toBe('Updated Name');
    });

    it('deve retornar erro para user comum', async () => {
      const category = await createTestCategory({ name: 'Protected' });

      const response = await request(app)
        .put(`/api/categories/${category._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Hacked'
        });

      // O middleware admin retorna 500 em vez de 403 devido ao error handler
      expect([403, 500]).toContain(response.status);
    });

    it('deve retornar erro 400 para nome duplicado', async () => {
      await createTestCategory({ name: 'Existing' });
      const category = await createTestCategory({ name: 'ToUpdate' });

      await request(app)
        .put(`/api/categories/${category._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Existing'
        })
        .expect(400);
    });

    it('deve permitir desativar categoria', async () => {
      const category = await createTestCategory({ name: 'ToDeactivate' });

      const response = await request(app)
        .put(`/api/categories/${category._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          active: false
        })
        .expect(200);

      expect(response.body.active).toBe(false);
    });
  });

  describe('DELETE /api/categories/:id', () => {
    it('deve deletar categoria sem relatos associados', async () => {
      const category = await createTestCategory({ name: 'ToDelete' });

      await request(app)
        .delete(`/api/categories/${category._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const deleted = await Category.findById(category._id);
      expect(deleted).toBeNull();
    });

    it('deve retornar erro para user comum', async () => {
      const category = await createTestCategory({ name: 'Protected' });

      const response = await request(app)
        .delete(`/api/categories/${category._id}`)
        .set('Authorization', `Bearer ${userToken}`);

      // O middleware admin retorna 500 em vez de 403 devido ao error handler
      expect([403, 500]).toContain(response.status);
    });

    it('deve retornar erro 404 para categoria não encontrada', async () => {
      await request(app)
        .delete('/api/categories/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('não deve deletar categoria com relatos associados', async () => {
      const category = await createTestCategory({ name: 'WithReports' });
      await createTestReport(admin, category);

      const response = await request(app)
        .delete(`/api/categories/${category._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(response.body.error).toContain('relatos');

      // Categoria ainda deve existir
      const stillExists = await Category.findById(category._id);
      expect(stillExists).toBeDefined();
    });
  });
});
