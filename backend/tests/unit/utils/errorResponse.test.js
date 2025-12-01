const ErrorResponse = require('../../../utils/errorResponse');

describe('ErrorResponse', () => {
  it('deve criar instância com mensagem e statusCode', () => {
    const error = new ErrorResponse('Test error', 400);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ErrorResponse);
    expect(error.message).toBe('Test error');
    expect(error.statusCode).toBe(400);
  });

  it('deve criar erro 404 Not Found', () => {
    const error = new ErrorResponse('Recurso não encontrado', 404);

    expect(error.message).toBe('Recurso não encontrado');
    expect(error.statusCode).toBe(404);
  });

  it('deve criar erro 401 Unauthorized', () => {
    const error = new ErrorResponse('Não autorizado', 401);

    expect(error.message).toBe('Não autorizado');
    expect(error.statusCode).toBe(401);
  });

  it('deve criar erro 500 Internal Server Error', () => {
    const error = new ErrorResponse('Erro interno do servidor', 500);

    expect(error.message).toBe('Erro interno do servidor');
    expect(error.statusCode).toBe(500);
  });

  it('deve ter stack trace como Error padrão', () => {
    const error = new ErrorResponse('Test error', 400);

    expect(error.stack).toBeDefined();
    expect(error.stack).toContain('Test error');
  });

  it('deve ser lançável como exceção', () => {
    expect(() => {
      throw new ErrorResponse('Test throw', 400);
    }).toThrow('Test throw');
  });

  it('deve ser capturável em try/catch', () => {
    try {
      throw new ErrorResponse('Caught error', 403);
    } catch (error) {
      expect(error.statusCode).toBe(403);
      expect(error.message).toBe('Caught error');
    }
  });
});
