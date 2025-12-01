const User = require('../../../models/User');

describe('User Model', () => {
  describe('Validações', () => {
    it('deve criar usuário com dados válidos', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Test@123'
      };

      const user = await User.create(userData);

      expect(user._id).toBeDefined();
      expect(user.name).toBe('John Doe');
      expect(user.email).toBe('john@example.com');
      expect(user.role).toBe('user'); // default
      expect(user.createdAt).toBeDefined();
    });

    it('deve rejeitar usuário sem nome', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Test@123'
      };

      await expect(User.create(userData)).rejects.toThrow('O nome é obrigatório');
    });

    it('deve rejeitar usuário sem email', async () => {
      const userData = {
        name: 'Test User',
        password: 'Test@123'
      };

      await expect(User.create(userData)).rejects.toThrow('O email é obrigatório');
    });

    it('deve rejeitar usuário sem senha', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com'
      };

      await expect(User.create(userData)).rejects.toThrow('A senha é obrigatória');
    });

    it('deve rejeitar email inválido', async () => {
      const userData = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'Test@123'
      };

      await expect(User.create(userData)).rejects.toThrow('email válido');
    });

    it('deve rejeitar nome muito curto', async () => {
      const userData = {
        name: 'J',
        email: 'test@example.com',
        password: 'Test@123'
      };

      await expect(User.create(userData)).rejects.toThrow('mínimo 2 caracteres');
    });

    it('deve rejeitar nome muito longo', async () => {
      const userData = {
        name: 'A'.repeat(101),
        email: 'test@example.com',
        password: 'Test@123'
      };

      await expect(User.create(userData)).rejects.toThrow('máximo 100 caracteres');
    });

    it('deve rejeitar senha muito curta', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: '12345'
      };

      await expect(User.create(userData)).rejects.toThrow('mínimo 6 caracteres');
    });

    it('deve rejeitar role inválido', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Test@123',
        role: 'superadmin'
      };

      await expect(User.create(userData)).rejects.toThrow('não é um papel válido');
    });

    it('deve rejeitar email duplicado', async () => {
      await User.create({
        name: 'First User',
        email: 'duplicate@example.com',
        password: 'Test@123'
      });

      await expect(
        User.create({
          name: 'Second User',
          email: 'duplicate@example.com',
          password: 'Test@123'
        })
      ).rejects.toThrow();
    });

    it('deve validar telefone válido', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'phone@example.com',
        password: 'Test@123',
        phone: '(11) 99999-9999'
      });

      expect(user.phone).toBe('(11) 99999-9999');
    });

    it('deve rejeitar telefone inválido', async () => {
      const userData = {
        name: 'Test User',
        email: 'phone@example.com',
        password: 'Test@123',
        phone: 'invalid'
      };

      await expect(User.create(userData)).rejects.toThrow('telefone inválido');
    });

    it('deve aceitar bio válida', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'bio@example.com',
        password: 'Test@123',
        bio: 'Uma biografia curta'
      });

      expect(user.bio).toBe('Uma biografia curta');
    });

    it('deve rejeitar bio muito longa', async () => {
      const userData = {
        name: 'Test User',
        email: 'bio@example.com',
        password: 'Test@123',
        bio: 'A'.repeat(501)
      };

      await expect(User.create(userData)).rejects.toThrow('máximo 500 caracteres');
    });
  });

  describe('Hash de Senha', () => {
    it('deve fazer hash da senha no save', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'hash@example.com',
        password: 'Test@123'
      });

      expect(user.password).not.toBe('Test@123');
      expect(user.password).toMatch(/^\$2[ab]\$/); // bcrypt hash
    });

    it('não deve fazer hash novamente se senha não foi modificada', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'nohash@example.com',
        password: 'Test@123'
      });

      const originalHash = user.password;
      user.name = 'Updated Name';
      await user.save();

      expect(user.password).toBe(originalHash);
    });

    it('deve fazer hash quando senha é modificada', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'rehash@example.com',
        password: 'Test@123'
      });

      const originalHash = user.password;
      user.password = 'NewPass@456';
      await user.save();

      expect(user.password).not.toBe(originalHash);
      expect(user.password).not.toBe('NewPass@456');
    });
  });

  describe('Métodos', () => {
    describe('matchPassword', () => {
      it('deve retornar true para senha correta', async () => {
        const user = await User.create({
          name: 'Test User',
          email: 'match@example.com',
          password: 'Test@123'
        });

        const isMatch = await user.matchPassword('Test@123');
        expect(isMatch).toBe(true);
      });

      it('deve retornar false para senha incorreta', async () => {
        const user = await User.create({
          name: 'Test User',
          email: 'nomatch@example.com',
          password: 'Test@123'
        });

        const isMatch = await user.matchPassword('WrongPassword');
        expect(isMatch).toBe(false);
      });

      it('deve retornar false para senha vazia', async () => {
        const user = await User.create({
          name: 'Test User',
          email: 'empty@example.com',
          password: 'Test@123'
        });

        const isMatch = await user.matchPassword('');
        expect(isMatch).toBe(false);
      });
    });

    describe('updateLastLogin', () => {
      it('deve atualizar lastLogin para data atual', async () => {
        const user = await User.create({
          name: 'Test User',
          email: 'login@example.com',
          password: 'Test@123'
        });

        expect(user.lastLogin).toBeNull();

        const beforeUpdate = new Date();
        await user.updateLastLogin();
        const afterUpdate = new Date();

        expect(user.lastLogin).toBeDefined();
        expect(user.lastLogin.getTime()).toBeGreaterThanOrEqual(beforeUpdate.getTime());
        expect(user.lastLogin.getTime()).toBeLessThanOrEqual(afterUpdate.getTime());
      });
    });
  });

  describe('Campos Opcionais', () => {
    it('deve aceitar socialMedia', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'social@example.com',
        password: 'Test@123',
        socialMedia: {
          facebook: 'facebook.com/user',
          twitter: '@user',
          linkedin: 'linkedin.com/in/user',
          instagram: '@user_insta'
        }
      });

      expect(user.socialMedia.facebook).toBe('facebook.com/user');
      expect(user.socialMedia.twitter).toBe('@user');
    });

    it('deve converter email para lowercase', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'TEST@EXAMPLE.COM',
        password: 'Test@123'
      });

      expect(user.email).toBe('test@example.com');
    });

    it('deve fazer trim no nome', async () => {
      const user = await User.create({
        name: '  Test User  ',
        email: 'trim@example.com',
        password: 'Test@123'
      });

      expect(user.name).toBe('Test User');
    });
  });

  describe('Roles', () => {
    it('deve criar usuário com role user por padrão', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'defaultrole@example.com',
        password: 'Test@123'
      });

      expect(user.role).toBe('user');
    });

    it('deve aceitar role admin', async () => {
      const user = await User.create({
        name: 'Admin User',
        email: 'adminrole@example.com',
        password: 'Test@123',
        role: 'admin'
      });

      expect(user.role).toBe('admin');
    });
  });
});
