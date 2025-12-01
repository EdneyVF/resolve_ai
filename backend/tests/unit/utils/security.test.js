const { validatePassword } = require('../../../config/security');

describe('Security Utils - validatePassword', () => {
  describe('senha válida', () => {
    it('deve aceitar senha com todos os requisitos', () => {
      const result = validatePassword('Test@123');

      expect(result.isValid).toBe(true);
      expect(result.message).toBeUndefined();
    });

    it('deve aceitar senha com diferentes caracteres especiais', () => {
      expect(validatePassword('Abc123!')).toEqual({ isValid: true });
      expect(validatePassword('Abc123@')).toEqual({ isValid: true });
      expect(validatePassword('Abc123#')).toEqual({ isValid: true });
      expect(validatePassword('Abc123$')).toEqual({ isValid: true });
      expect(validatePassword('Abc123.')).toEqual({ isValid: true });
      expect(validatePassword('Abc123,')).toEqual({ isValid: true });
    });

    it('deve aceitar senha longa com todos os requisitos', () => {
      const result = validatePassword('MinhaSenhaSegura@123456');

      expect(result.isValid).toBe(true);
    });
  });

  describe('senha inválida - sem número', () => {
    it('deve rejeitar senha sem número', () => {
      const result = validatePassword('Test@abc');

      expect(result.isValid).toBe(false);
      expect(result.message).toContain('pelo menos um número');
    });
  });

  describe('senha inválida - sem letra', () => {
    it('deve rejeitar senha sem letra', () => {
      const result = validatePassword('1234@567');

      expect(result.isValid).toBe(false);
      expect(result.message).toContain('pelo menos uma letra');
    });
  });

  describe('senha inválida - sem caractere especial', () => {
    it('deve rejeitar senha sem caractere especial', () => {
      const result = validatePassword('Test1234');

      expect(result.isValid).toBe(false);
      expect(result.message).toContain('pelo menos um caractere especial');
    });
  });

  describe('senha inválida - muito curta', () => {
    it('deve rejeitar senha com menos de 6 caracteres', () => {
      const result = validatePassword('Ab@1');

      expect(result.isValid).toBe(false);
      expect(result.message).toContain('mínimo de 6 caracteres');
    });

    it('deve rejeitar senha vazia', () => {
      const result = validatePassword('');

      expect(result.isValid).toBe(false);
    });
  });

  describe('senha inválida - múltiplos problemas', () => {
    it('deve listar múltiplos requisitos faltando', () => {
      const result = validatePassword('abc');

      expect(result.isValid).toBe(false);
      expect(result.message).toContain('mínimo de 6 caracteres');
      expect(result.message).toContain('pelo menos um número');
      expect(result.message).toContain('pelo menos um caractere especial');
    });
  });
});
