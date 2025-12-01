const mongoose = require('mongoose');

/**
 * Limpar todas as collections do banco
 */
const clearDatabase = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

/**
 * Desconectar do banco de dados
 */
const closeDatabase = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
};

/**
 * Gerar ObjectId válido do MongoDB
 * @returns {mongoose.Types.ObjectId}
 */
const generateObjectId = () => {
  return new mongoose.Types.ObjectId();
};

/**
 * Verificar se é um ObjectId válido
 * @param {string} id - ID para verificar
 * @returns {boolean}
 */
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Esperar um tempo específico (útil para testes async)
 * @param {number} ms - Milissegundos para esperar
 * @returns {Promise<void>}
 */
const wait = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Extrair mensagem de erro de resposta da API
 * @param {Object} response - Resposta do supertest
 * @returns {string} Mensagem de erro
 */
const getErrorMessage = (response) => {
  return response.body.message || response.body.error || '';
};

module.exports = {
  clearDatabase,
  closeDatabase,
  generateObjectId,
  isValidObjectId,
  wait,
  getErrorMessage
};
