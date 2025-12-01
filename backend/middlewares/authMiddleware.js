const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {

      token = req.headers.authorization.split(' ')[1];

      if (!token || token === 'null' || token === 'undefined') {
        res.status(401);
        throw new Error('Token inválido');
      }

      let decoded;
      try {

        decoded = jwt.verify(token, process.env.JWT_SECRET, {
          audience: 'resolveai-app',
          issuer: 'resolveai-api'
        });
      } catch (verifyError) {

        try {
          decoded = jwt.verify(token, process.env.JWT_SECRET);
          console.log('Token verificado em modo de compatibilidade');
        } catch (fallbackError) {

          console.error('Erro na verificação do token:', verifyError.message);
          console.error('Erro no fallback:', fallbackError.message);
          throw verifyError; // Usar o erro original
        }
      }

      if (!decoded.id) {
        res.status(401);
        throw new Error('Token mal formado');
      }

      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        res.status(401);
        throw new Error('Usuário não encontrado');
      }


      if (decoded.role && decoded.role !== user.role) {
        res.status(401);
        throw new Error('Token inválido: informações inconsistentes');
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('Erro de autenticação:', error.name, error.message);
      
      if (error.name === 'JsonWebTokenError') {
        res.status(401);
        throw new Error('Token inválido');
      }
      if (error.name === 'TokenExpiredError') {
        res.status(401);
        throw new Error('Token expirado');
      }
      throw error;
    }
  } else {
    res.status(401);
    throw new Error('Não autorizado, token não encontrado');
  }
});

const admin = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    res.status(401);
    throw new Error('Não autorizado');
  }

  if (req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Não autorizado, acesso apenas para administradores');
  }

  next();
});

// Middleware that optionally authenticates the user if a token is provided
// Does not fail if no token is present - just continues without req.user
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      if (token && token !== 'null' && token !== 'undefined') {
        let decoded;
        try {
          decoded = jwt.verify(token, process.env.JWT_SECRET, {
            audience: 'resolveai-app',
            issuer: 'resolveai-api'
          });
        } catch (verifyError) {
          try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
          } catch (fallbackError) {
            // Token invalid, continue without user
            return next();
          }
        }

        if (decoded && decoded.id) {
          const user = await User.findById(decoded.id).select('-password');
          if (user) {
            req.user = user;
          }
        }
      }
    } catch (error) {
      // Any error, continue without user
    }
  }
  next();
});

module.exports = {
  protect,
  admin,
  optionalAuth
};