const Category = require('../../../models/Category');

describe('Category Model', () => {
  describe('Validações', () => {
    it('deve criar categoria com dados válidos', async () => {
      const category = await Category.create({
        name: 'Infraestrutura',
        description: 'Problemas de infraestrutura urbana'
      });

      expect(category._id).toBeDefined();
      expect(category.name).toBe('Infraestrutura');
      expect(category.description).toBe('Problemas de infraestrutura urbana');
      expect(category.active).toBe(true); // default
      expect(category.createdAt).toBeDefined();
    });

    it('deve criar categoria apenas com nome', async () => {
      const category = await Category.create({
        name: 'Segurança'
      });

      expect(category.name).toBe('Segurança');
      expect(category.description).toBeUndefined();
      expect(category.active).toBe(true);
    });

    it('deve rejeitar categoria sem nome', async () => {
      await expect(
        Category.create({ description: 'Uma descrição' })
      ).rejects.toThrow('O nome da categoria é obrigatório');
    });

    it('deve rejeitar nome muito curto', async () => {
      await expect(
        Category.create({ name: 'A' })
      ).rejects.toThrow('mínimo 2 caracteres');
    });

    it('deve rejeitar nome muito longo', async () => {
      await expect(
        Category.create({ name: 'A'.repeat(51) })
      ).rejects.toThrow('máximo 50 caracteres');
    });

    it('deve rejeitar descrição muito longa', async () => {
      await expect(
        Category.create({
          name: 'Test Category',
          description: 'A'.repeat(201)
        })
      ).rejects.toThrow('máximo 200 caracteres');
    });

    it('deve rejeitar nome duplicado', async () => {
      await Category.create({ name: 'Duplicada' });

      await expect(
        Category.create({ name: 'Duplicada' })
      ).rejects.toThrow();
    });
  });

  describe('Campos', () => {
    it('deve fazer trim no nome', async () => {
      const category = await Category.create({
        name: '  Trimmed Category  '
      });

      expect(category.name).toBe('Trimmed Category');
    });

    it('deve fazer trim na descrição', async () => {
      const category = await Category.create({
        name: 'Test',
        description: '  Trimmed description  '
      });

      expect(category.description).toBe('Trimmed description');
    });

    it('deve criar com active = true por padrão', async () => {
      const category = await Category.create({
        name: 'Active by Default'
      });

      expect(category.active).toBe(true);
    });

    it('deve criar com active = false quando especificado', async () => {
      const category = await Category.create({
        name: 'Inactive Category',
        active: false
      });

      expect(category.active).toBe(false);
    });
  });

  describe('Timestamps', () => {
    it('deve ter createdAt e updatedAt', async () => {
      const category = await Category.create({
        name: 'Timestamp Test'
      });

      expect(category.createdAt).toBeInstanceOf(Date);
      expect(category.updatedAt).toBeInstanceOf(Date);
    });

    it('deve atualizar updatedAt na modificação', async () => {
      const category = await Category.create({
        name: 'Update Test'
      });

      const originalUpdatedAt = category.updatedAt;

      // Esperar um pouco para garantir diferença de tempo
      await new Promise(resolve => setTimeout(resolve, 100));

      category.description = 'Nova descrição';
      await category.save();

      expect(category.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });

  describe('Operações de Atualização', () => {
    it('deve permitir atualizar nome', async () => {
      const category = await Category.create({
        name: 'Original Name'
      });

      category.name = 'Updated Name';
      await category.save();

      const updated = await Category.findById(category._id);
      expect(updated.name).toBe('Updated Name');
    });

    it('deve permitir desativar categoria', async () => {
      const category = await Category.create({
        name: 'To Deactivate'
      });

      expect(category.active).toBe(true);

      category.active = false;
      await category.save();

      const updated = await Category.findById(category._id);
      expect(updated.active).toBe(false);
    });

    it('deve permitir reativar categoria', async () => {
      const category = await Category.create({
        name: 'To Reactivate',
        active: false
      });

      category.active = true;
      await category.save();

      const updated = await Category.findById(category._id);
      expect(updated.active).toBe(true);
    });
  });
});
