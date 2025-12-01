const {
  validateEmail,
  validatePhone,
  validateName,
  validateBio
} = require('../../../utils/validation');

describe('Validation Utils', () => {
  describe('validateEmail', () => {
    it('deve retornar true para email válido', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.com')).toBe(true);
      expect(validateEmail('user+tag@example.org')).toBe(true);
    });

    it('deve retornar false para email inválido', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('invalid@')).toBe(false);
      expect(validateEmail('@domain.com')).toBe(false);
      expect(validateEmail('user@')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });

    it('deve retornar false para email com espaços', () => {
      expect(validateEmail('test @example.com')).toBe(false);
      expect(validateEmail(' test@example.com')).toBe(false);
    });
  });

  describe('validatePhone', () => {
    it('deve retornar true para telefone válido', () => {
      expect(validatePhone('(11) 99999-9999')).toBe(true);
      expect(validatePhone('11 99999-9999')).toBe(true);
      expect(validatePhone('+55 11 99999-9999')).toBe(true);
      expect(validatePhone('11999999999')).toBe(true);
    });

    it('deve retornar true para telefone vazio ou nulo', () => {
      expect(validatePhone('')).toBe(true);
      expect(validatePhone(null)).toBe(true);
      expect(validatePhone(undefined)).toBe(true);
    });

    it('deve retornar false para telefone inválido', () => {
      expect(validatePhone('abc')).toBe(false);
      expect(validatePhone('123')).toBe(false);
      expect(validatePhone('phone: 999')).toBe(false);
    });
  });

  describe('validateName', () => {
    it('deve retornar true para nome válido', () => {
      expect(validateName('Jo')).toBe(true);
      expect(validateName('John Doe')).toBe(true);
      expect(validateName('A'.repeat(100))).toBe(true);
    });

    it('deve retornar false para nome muito curto', () => {
      expect(validateName('J')).toBeFalsy();
      expect(validateName('')).toBeFalsy();
    });

    it('deve retornar false para nome muito longo', () => {
      expect(validateName('A'.repeat(101))).toBe(false);
    });

    it('deve retornar false para nome nulo ou undefined', () => {
      expect(validateName(null)).toBeFalsy();
      expect(validateName(undefined)).toBeFalsy();
    });
  });

  describe('validateBio', () => {
    it('deve retornar true para bio válida', () => {
      expect(validateBio('Uma bio curta')).toBe(true);
      expect(validateBio('A'.repeat(500))).toBe(true);
    });

    it('deve retornar true para bio vazia ou nula', () => {
      expect(validateBio('')).toBe(true);
      expect(validateBio(null)).toBe(true);
      expect(validateBio(undefined)).toBe(true);
    });

    it('deve retornar false para bio muito longa', () => {
      expect(validateBio('A'.repeat(501))).toBe(false);
    });
  });
});
