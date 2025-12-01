const User = require('../../models/User');
const Report = require('../../models/Report');
const Category = require('../../models/Category');
const jwt = require('jsonwebtoken');

/**
 * Criar usuário de teste
 * @param {Object} overrides - Campos para sobrescrever os padrões
 * @returns {Promise<User>} Usuário criado
 */
const createTestUser = async (overrides = {}) => {
  const defaultUser = {
    name: 'Test User',
    email: `test${Date.now()}@example.com`,
    password: 'Test@123',
    role: 'user',
    ...overrides
  };
  return await User.create(defaultUser);
};

/**
 * Criar admin de teste
 * @param {Object} overrides - Campos para sobrescrever os padrões
 * @returns {Promise<User>} Admin criado
 */
const createTestAdmin = async (overrides = {}) => {
  return await createTestUser({
    role: 'admin',
    email: `admin${Date.now()}@example.com`,
    ...overrides
  });
};

/**
 * Criar categoria de teste
 * @param {Object} overrides - Campos para sobrescrever os padrões
 * @returns {Promise<Category>} Categoria criada
 */
const createTestCategory = async (overrides = {}) => {
  const defaultCategory = {
    name: `Category ${Date.now()}`,
    description: 'Test category description',
    active: true,
    ...overrides
  };
  return await Category.create(defaultCategory);
};

/**
 * Criar relato de teste
 * @param {User} organizer - Usuário organizador
 * @param {Category} category - Categoria do relato
 * @param {Object} overrides - Campos para sobrescrever os padrões
 * @returns {Promise<Report>} Relato criado
 */
const createTestReport = async (organizer, category, overrides = {}) => {
  const defaultReport = {
    title: 'Test Report Title',
    description: 'Test description with enough characters for validation',
    date: new Date(),
    location: {
      address: 'Test Address, 123',
      city: 'Test City',
      state: 'TS',
      country: 'Brasil'
    },
    organizer: organizer._id,
    category: category._id,
    ...overrides
  };
  return await Report.create(defaultReport);
};

/**
 * Gerar token JWT válido para testes
 * @param {User} user - Usuário para gerar token
 * @returns {string} Token JWT
 */
const generateAuthToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET || 'test_jwt_secret_key',
    {
      expiresIn: '1h',
      audience: 'resolveai-app',
      issuer: 'resolveai-api'
    }
  );
};

/**
 * Gerar refresh token válido para testes
 * @param {User} user - Usuário para gerar token
 * @returns {string} Refresh Token
 */
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.REFRESH_TOKEN_SECRET || 'test_refresh_secret_key',
    {
      expiresIn: '7d',
      audience: 'resolveai-app',
      issuer: 'resolveai-api'
    }
  );
};

/**
 * Criar dados de usuário válidos (sem salvar no banco)
 * @param {Object} overrides - Campos para sobrescrever os padrões
 * @returns {Object} Dados do usuário
 */
const buildUserData = (overrides = {}) => {
  return {
    name: 'Test User',
    email: `test${Date.now()}@example.com`,
    password: 'Test@123',
    ...overrides
  };
};

/**
 * Criar dados de relato válidos (sem salvar no banco)
 * @param {string} organizerId - ID do organizador
 * @param {string} categoryId - ID da categoria
 * @param {Object} overrides - Campos para sobrescrever os padrões
 * @returns {Object} Dados do relato
 */
const buildReportData = (organizerId, categoryId, overrides = {}) => {
  return {
    title: 'Test Report Title',
    description: 'Test description with enough characters for validation',
    date: new Date().toISOString(),
    location: {
      address: 'Test Address, 123',
      city: 'Test City',
      state: 'TS',
      country: 'Brasil'
    },
    organizer: organizerId,
    category: categoryId,
    ...overrides
  };
};

module.exports = {
  createTestUser,
  createTestAdmin,
  createTestCategory,
  createTestReport,
  generateAuthToken,
  generateRefreshToken,
  buildUserData,
  buildReportData
};
