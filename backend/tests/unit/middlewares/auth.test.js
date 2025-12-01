const jwt = require('jsonwebtoken');
const { protect, admin } = require('../../../middlewares/authMiddleware');
const User = require('../../../models/User');
const { generateAuthToken } = require('../../setup/factories');

describe('Auth Middleware', () => {
  let mockReq;
  let mockRes;
  let mockNext;
  let testUser;
  let testAdmin;

  beforeEach(async () => {
    // Criar usuários de teste
    testUser = await User.create({
      name: 'Test User',
      email: 'user@test.com',
      password: 'Test@123',
      role: 'user'
    });

    testAdmin = await User.create({
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'Test@123',
      role: 'admin'
    });

    // Mock de req, res, next
    mockReq = {
      headers: {}
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    mockNext = jest.fn();
  });

  describe('protect middleware', () => {
    it('deve chamar next() para token válido', async () => {
      const token = generateAuthToken(testUser);
      mockReq.headers.authorization = `Bearer ${token}`;

      await protect(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(); // chamado sem argumentos (sucesso)
      expect(mockReq.user).toBeDefined();
      expect(mockReq.user._id.toString()).toBe(testUser._id.toString());
    });

    it('deve adicionar user ao req para token válido', async () => {
      const token = generateAuthToken(testUser);
      mockReq.headers.authorization = `Bearer ${token}`;

      await protect(mockReq, mockRes, mockNext);

      expect(mockReq.user).toBeDefined();
      expect(mockReq.user.email).toBe('user@test.com');
      expect(mockReq.user.role).toBe('user');
      expect(mockReq.user.password).toBeUndefined(); // senha não deve estar presente
    });

    it('deve chamar next com erro quando token não está presente', async () => {
      // Sem header de authorization
      await protect(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockNext).toHaveBeenCalled();
      const nextArg = mockNext.mock.calls[0][0];
      expect(nextArg).toBeInstanceOf(Error);
    });

    it('deve chamar next com erro para header Authorization sem Bearer', async () => {
      mockReq.headers.authorization = 'invalid-format';

      await protect(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockNext).toHaveBeenCalled();
      const nextArg = mockNext.mock.calls[0][0];
      expect(nextArg).toBeInstanceOf(Error);
    });

    it('deve chamar next com erro para token inválido', async () => {
      mockReq.headers.authorization = 'Bearer invalid-token';

      await protect(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockNext).toHaveBeenCalled();
      const nextArg = mockNext.mock.calls[0][0];
      expect(nextArg).toBeInstanceOf(Error);
      expect(nextArg.message).toContain('Token inválido');
    });

    it('deve chamar next com erro para token expirado', async () => {
      // Criar token expirado
      const expiredToken = jwt.sign(
        { id: testUser._id, role: testUser.role, email: testUser.email },
        process.env.JWT_SECRET,
        { expiresIn: '-1s' } // já expirado
      );
      mockReq.headers.authorization = `Bearer ${expiredToken}`;

      await protect(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockNext).toHaveBeenCalled();
      const nextArg = mockNext.mock.calls[0][0];
      expect(nextArg).toBeInstanceOf(Error);
      expect(nextArg.message).toContain('Token expirado');
    });

    it('deve chamar next com erro para token null', async () => {
      mockReq.headers.authorization = 'Bearer null';

      await protect(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockNext).toHaveBeenCalled();
      const nextArg = mockNext.mock.calls[0][0];
      expect(nextArg).toBeInstanceOf(Error);
      expect(nextArg.message).toContain('Token inválido');
    });

    it('deve chamar next com erro para token undefined', async () => {
      mockReq.headers.authorization = 'Bearer undefined';

      await protect(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockNext).toHaveBeenCalled();
      const nextArg = mockNext.mock.calls[0][0];
      expect(nextArg).toBeInstanceOf(Error);
      expect(nextArg.message).toContain('Token inválido');
    });

    it('deve chamar next com erro para usuário não encontrado', async () => {
      // Criar token com ID de usuário que não existe
      const fakeUserId = '507f1f77bcf86cd799439011';
      const token = jwt.sign(
        { id: fakeUserId, role: 'user', email: 'fake@test.com' },
        process.env.JWT_SECRET,
        {
          expiresIn: '1h',
          audience: 'resolveai-app',
          issuer: 'resolveai-api'
        }
      );
      mockReq.headers.authorization = `Bearer ${token}`;

      await protect(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockNext).toHaveBeenCalled();
      const nextArg = mockNext.mock.calls[0][0];
      expect(nextArg).toBeInstanceOf(Error);
      expect(nextArg.message).toContain('Usuário não encontrado');
    });

    it('deve chamar next com erro para token sem id', async () => {
      const tokenWithoutId = jwt.sign(
        { role: 'user', email: 'test@test.com' },
        process.env.JWT_SECRET,
        {
          expiresIn: '1h',
          audience: 'resolveai-app',
          issuer: 'resolveai-api'
        }
      );
      mockReq.headers.authorization = `Bearer ${tokenWithoutId}`;

      await protect(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockNext).toHaveBeenCalled();
      const nextArg = mockNext.mock.calls[0][0];
      expect(nextArg).toBeInstanceOf(Error);
      expect(nextArg.message).toContain('Token mal formado');
    });

    it('deve chamar next com erro para role inconsistente', async () => {
      // Criar token com role diferente do usuário no banco
      const tokenWithWrongRole = jwt.sign(
        { id: testUser._id, role: 'admin', email: testUser.email },
        process.env.JWT_SECRET,
        {
          expiresIn: '1h',
          audience: 'resolveai-app',
          issuer: 'resolveai-api'
        }
      );
      mockReq.headers.authorization = `Bearer ${tokenWithWrongRole}`;

      await protect(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockNext).toHaveBeenCalled();
      const nextArg = mockNext.mock.calls[0][0];
      expect(nextArg).toBeInstanceOf(Error);
      expect(nextArg.message).toContain('informações inconsistentes');
    });
  });

  describe('admin middleware', () => {
    it('deve chamar next() para usuário admin', async () => {
      mockReq.user = testAdmin;

      await admin(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(); // chamado sem argumentos (sucesso)
    });

    it('deve chamar next com erro para usuário comum', async () => {
      mockReq.user = testUser;

      await admin(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockNext).toHaveBeenCalled();
      const nextArg = mockNext.mock.calls[0][0];
      expect(nextArg).toBeInstanceOf(Error);
    });

    it('deve chamar next com erro quando req.user não está definido', async () => {
      mockReq.user = undefined;

      await admin(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockNext).toHaveBeenCalled();
      const nextArg = mockNext.mock.calls[0][0];
      expect(nextArg).toBeInstanceOf(Error);
      expect(nextArg.message).toContain('Não autorizado');
    });

    it('deve chamar next com erro quando req.user é null', async () => {
      mockReq.user = null;

      await admin(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockNext).toHaveBeenCalled();
      const nextArg = mockNext.mock.calls[0][0];
      expect(nextArg).toBeInstanceOf(Error);
      expect(nextArg.message).toContain('Não autorizado');
    });
  });

  describe('protect + admin juntos', () => {
    it('deve passar admin por ambos middlewares', async () => {
      const token = generateAuthToken(testAdmin);
      mockReq.headers.authorization = `Bearer ${token}`;

      await protect(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(); // chamado sem argumentos (sucesso)

      mockNext.mockClear();
      await admin(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(); // chamado sem argumentos (sucesso)
    });

    it('deve passar user por protect mas chamar next com erro em admin', async () => {
      const token = generateAuthToken(testUser);
      mockReq.headers.authorization = `Bearer ${token}`;

      await protect(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(); // chamado sem argumentos (sucesso)
      expect(mockReq.user.role).toBe('user');

      mockNext.mockClear();
      await admin(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockNext).toHaveBeenCalled();
      const nextArg = mockNext.mock.calls[0][0];
      expect(nextArg).toBeInstanceOf(Error);
    });
  });
});
