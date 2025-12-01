const testDb = require('./tests/setup/testDb');

// Configurar variáveis de ambiente para testes
process.env.JWT_SECRET = 'test_jwt_secret_key';
process.env.REFRESH_TOKEN_SECRET = 'test_refresh_secret_key';
process.env.JWT_EXPIRE = '1h';
process.env.REFRESH_TOKEN_EXPIRE = '7d';
process.env.NODE_ENV = 'test';

// Conectar antes de todos os testes
beforeAll(async () => {
  await testDb.connect();
});

// Limpar banco após cada teste
afterEach(async () => {
  await testDb.clear();
});

// Desconectar após todos os testes
afterAll(async () => {
  await testDb.disconnect();
});
