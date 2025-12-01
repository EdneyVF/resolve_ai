const Report = require('../../../models/Report');
const User = require('../../../models/User');
const Category = require('../../../models/Category');

describe('Report Model', () => {
  let user;
  let admin;
  let category;

  beforeEach(async () => {
    // Criar usuário comum
    user = await User.create({
      name: 'Test User',
      email: 'user@example.com',
      password: 'Test@123',
      role: 'user'
    });

    // Criar admin
    admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'Test@123',
      role: 'admin'
    });

    // Criar categoria
    category = await Category.create({
      name: 'Test Category',
      description: 'Test description'
    });
  });

  describe('Validações', () => {
    it('deve criar relato com dados válidos', async () => {
      const report = await Report.create({
        title: 'Test Report',
        description: 'Description with enough characters',
        date: new Date(),
        location: {
          address: 'Test Address, 123',
          city: 'Test City',
          state: 'TS',
          country: 'Brasil'
        },
        organizer: user._id,
        category: category._id
      });

      expect(report._id).toBeDefined();
      expect(report.title).toBe('Test Report');
      expect(report.approvalStatus).toBe('pending'); // usuário comum
      expect(report.status).toBe('inactive');
    });

    it('deve rejeitar relato sem título', async () => {
      await expect(
        Report.create({
          description: 'Description with enough characters',
          date: new Date(),
          location: {
            address: 'Test Address',
            city: 'Test City',
            state: 'TS',
            country: 'Brasil'
          },
          organizer: user._id,
          category: category._id
        })
      ).rejects.toThrow('título do relato é obrigatório');
    });

    it('deve rejeitar título muito curto', async () => {
      await expect(
        Report.create({
          title: 'AB',
          description: 'Description with enough characters',
          date: new Date(),
          location: {
            address: 'Test Address',
            city: 'Test City',
            state: 'TS',
            country: 'Brasil'
          },
          organizer: user._id,
          category: category._id
        })
      ).rejects.toThrow('mínimo 3 caracteres');
    });

    it('deve rejeitar título muito longo', async () => {
      await expect(
        Report.create({
          title: 'A'.repeat(101),
          description: 'Description with enough characters',
          date: new Date(),
          location: {
            address: 'Test Address',
            city: 'Test City',
            state: 'TS',
            country: 'Brasil'
          },
          organizer: user._id,
          category: category._id
        })
      ).rejects.toThrow('máximo 100 caracteres');
    });

    it('deve rejeitar descrição muito curta', async () => {
      await expect(
        Report.create({
          title: 'Test Report',
          description: 'Short',
          date: new Date(),
          location: {
            address: 'Test Address',
            city: 'Test City',
            state: 'TS',
            country: 'Brasil'
          },
          organizer: user._id,
          category: category._id
        })
      ).rejects.toThrow('mínimo 10 caracteres');
    });

    it('deve rejeitar relato sem data', async () => {
      await expect(
        Report.create({
          title: 'Test Report',
          description: 'Description with enough characters',
          location: {
            address: 'Test Address',
            city: 'Test City',
            state: 'TS',
            country: 'Brasil'
          },
          organizer: user._id,
          category: category._id
        })
      ).rejects.toThrow('data do relato é obrigatória');
    });

    it('deve rejeitar relato sem endereço', async () => {
      await expect(
        Report.create({
          title: 'Test Report',
          description: 'Description with enough characters',
          date: new Date(),
          location: {
            city: 'Test City',
            state: 'TS',
            country: 'Brasil'
          },
          organizer: user._id,
          category: category._id
        })
      ).rejects.toThrow('endereço do relato é obrigatório');
    });

    it('deve rejeitar relato sem cidade', async () => {
      await expect(
        Report.create({
          title: 'Test Report',
          description: 'Description with enough characters',
          date: new Date(),
          location: {
            address: 'Test Address',
            state: 'TS',
            country: 'Brasil'
          },
          organizer: user._id,
          category: category._id
        })
      ).rejects.toThrow('cidade do relato é obrigatória');
    });

    it('deve rejeitar relato sem categoria', async () => {
      await expect(
        Report.create({
          title: 'Test Report',
          description: 'Description with enough characters',
          date: new Date(),
          location: {
            address: 'Test Address',
            city: 'Test City',
            state: 'TS',
            country: 'Brasil'
          },
          organizer: user._id
        })
      ).rejects.toThrow('categoria do relato é obrigatória');
    });

    it('deve rejeitar relato sem organizador', async () => {
      await expect(
        Report.create({
          title: 'Test Report',
          description: 'Description with enough characters',
          date: new Date(),
          location: {
            address: 'Test Address',
            city: 'Test City',
            state: 'TS',
            country: 'Brasil'
          },
          category: category._id
        })
      ).rejects.toThrow('organizador do relato é obrigatório');
    });

    it('deve validar URL de imagem válida', async () => {
      const report = await Report.create({
        title: 'Test Report',
        description: 'Description with enough characters',
        date: new Date(),
        location: {
          address: 'Test Address',
          city: 'Test City',
          state: 'TS',
          country: 'Brasil'
        },
        organizer: user._id,
        category: category._id,
        imageUrl: 'https://example.com/image.jpg'
      });

      expect(report.imageUrl).toBe('https://example.com/image.jpg');
    });

    it('deve rejeitar URL de imagem inválida', async () => {
      await expect(
        Report.create({
          title: 'Test Report',
          description: 'Description with enough characters',
          date: new Date(),
          location: {
            address: 'Test Address',
            city: 'Test City',
            state: 'TS',
            country: 'Brasil'
          },
          organizer: user._id,
          category: category._id,
          imageUrl: 'invalid-url'
        })
      ).rejects.toThrow('não é uma URL válida');
    });
  });

  describe('Auto-aprovação para Admin', () => {
    it('deve auto-aprovar relato criado por admin', async () => {
      const report = await Report.create({
        title: 'Admin Report',
        description: 'Description with enough characters',
        date: new Date(),
        location: {
          address: 'Test Address',
          city: 'Test City',
          state: 'TS',
          country: 'Brasil'
        },
        organizer: admin._id,
        category: category._id
      });

      expect(report.approvalStatus).toBe('approved');
      expect(report.status).toBe('active');
      expect(report.approvedBy.toString()).toBe(admin._id.toString());
      expect(report.approvalDate).toBeDefined();
    });

    it('deve deixar pendente relato criado por usuário comum', async () => {
      const report = await Report.create({
        title: 'User Report',
        description: 'Description with enough characters',
        date: new Date(),
        location: {
          address: 'Test Address',
          city: 'Test City',
          state: 'TS',
          country: 'Brasil'
        },
        organizer: user._id,
        category: category._id
      });

      expect(report.approvalStatus).toBe('pending');
      expect(report.status).toBe('inactive');
      expect(report.approvedBy).toBeNull();
    });
  });

  describe('Métodos', () => {
    describe('approve', () => {
      it('deve aprovar relato corretamente', async () => {
        const report = await Report.create({
          title: 'To Approve',
          description: 'Description with enough characters',
          date: new Date(),
          location: {
            address: 'Test Address',
            city: 'Test City',
            state: 'TS',
            country: 'Brasil'
          },
          organizer: user._id,
          category: category._id
        });

        await report.approve(admin._id);

        expect(report.approvalStatus).toBe('approved');
        expect(report.status).toBe('active');
        expect(report.approvedBy.toString()).toBe(admin._id.toString());
        expect(report.approvalDate).toBeDefined();
        expect(report.rejectionReason).toBeNull();
      });
    });

    describe('reject', () => {
      it('deve rejeitar relato com motivo', async () => {
        const report = await Report.create({
          title: 'To Reject',
          description: 'Description with enough characters',
          date: new Date(),
          location: {
            address: 'Test Address',
            city: 'Test City',
            state: 'TS',
            country: 'Brasil'
          },
          organizer: user._id,
          category: category._id
        });

        await report.reject(admin._id, 'Conteúdo inapropriado');

        expect(report.approvalStatus).toBe('rejected');
        expect(report.status).toBe('inactive');
        expect(report.approvedBy.toString()).toBe(admin._id.toString());
        expect(report.rejectionReason).toBe('Conteúdo inapropriado');
      });

      it('deve rejeitar relato sem motivo', async () => {
        const report = await Report.create({
          title: 'To Reject No Reason',
          description: 'Description with enough characters',
          date: new Date(),
          location: {
            address: 'Test Address',
            city: 'Test City',
            state: 'TS',
            country: 'Brasil'
          },
          organizer: user._id,
          category: category._id
        });

        await report.reject(admin._id);

        expect(report.approvalStatus).toBe('rejected');
        expect(report.rejectionReason).toBeNull();
      });
    });
  });

  describe('Virtual isApproved', () => {
    it('deve retornar true quando aprovado', async () => {
      const report = await Report.create({
        title: 'Approved Report',
        description: 'Description with enough characters',
        date: new Date(),
        location: {
          address: 'Test Address',
          city: 'Test City',
          state: 'TS',
          country: 'Brasil'
        },
        organizer: admin._id,
        category: category._id
      });

      expect(report.isApproved).toBe(true);
    });

    it('deve retornar false quando pendente', async () => {
      const report = await Report.create({
        title: 'Pending Report',
        description: 'Description with enough characters',
        date: new Date(),
        location: {
          address: 'Test Address',
          city: 'Test City',
          state: 'TS',
          country: 'Brasil'
        },
        organizer: user._id,
        category: category._id
      });

      expect(report.isApproved).toBe(false);
    });

    it('deve retornar false quando rejeitado', async () => {
      const report = await Report.create({
        title: 'Rejected Report',
        description: 'Description with enough characters',
        date: new Date(),
        location: {
          address: 'Test Address',
          city: 'Test City',
          state: 'TS',
          country: 'Brasil'
        },
        organizer: user._id,
        category: category._id
      });

      await report.reject(admin._id, 'Motivo');

      expect(report.isApproved).toBe(false);
    });
  });

  describe('Tags', () => {
    it('deve aceitar array de tags', async () => {
      const report = await Report.create({
        title: 'Tagged Report',
        description: 'Description with enough characters',
        date: new Date(),
        location: {
          address: 'Test Address',
          city: 'Test City',
          state: 'TS',
          country: 'Brasil'
        },
        organizer: user._id,
        category: category._id,
        tags: ['urgente', 'importante', 'bairro-centro']
      });

      expect(report.tags).toHaveLength(3);
      expect(report.tags).toContain('urgente');
    });
  });

  describe('Status Transitions', () => {
    it('deve mudar status para active quando aprovado', async () => {
      const report = await Report.create({
        title: 'Status Test',
        description: 'Description with enough characters',
        date: new Date(),
        location: {
          address: 'Test Address',
          city: 'Test City',
          state: 'TS',
          country: 'Brasil'
        },
        organizer: user._id,
        category: category._id
      });

      expect(report.status).toBe('inactive');

      report.approvalStatus = 'approved';
      await report.save();

      expect(report.status).toBe('active');
    });

    it('deve mudar status para inactive quando rejeitado', async () => {
      // Primeiro aprovar
      const report = await Report.create({
        title: 'Status Test 2',
        description: 'Description with enough characters',
        date: new Date(),
        location: {
          address: 'Test Address',
          city: 'Test City',
          state: 'TS',
          country: 'Brasil'
        },
        organizer: admin._id,
        category: category._id
      });

      expect(report.status).toBe('active');

      report.approvalStatus = 'rejected';
      await report.save();

      expect(report.status).toBe('inactive');
    });
  });
});
