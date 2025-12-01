const User = require('../models/User');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const { validatePassword } = require('../config/security');
const ErrorResponse = require('../utils/errorResponse');

const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, bio } = req.body;

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    throw new ErrorResponse(passwordValidation.message, 400);
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new ErrorResponse('Email já cadastrado', 400);
  }

  const user = await User.create({
    name,
    email,
    password,
    phone,
    bio
  });

  if (user) {

    const accessToken = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: accessToken,
      refreshToken: refreshToken
    });
  } else {
    throw new ErrorResponse('Dados de usuário inválidos', 400);
  }
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ErrorResponse('Email e senha são obrigatórios', 400);
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ErrorResponse('Email ou senha inválidos', 401);
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw new ErrorResponse('Email ou senha inválidos', 401);
  }

  user.lastLogin = new Date();
  await user.save();

  const accessToken = generateToken(user);
  const refreshToken = generateRefreshToken(user);

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: accessToken,
    refreshToken: refreshToken
  });
});

const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select('-password');

  if (!user) {
    throw new ErrorResponse('Usuário não encontrado', 404);
  }

  res.json(user);
});

const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const passwordValidation = validatePassword(newPassword);
  if (!passwordValidation.isValid) {
    throw new ErrorResponse(passwordValidation.message, 400);
  }

  const user = await User.findById(req.user._id);

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    throw new ErrorResponse('Senha atual incorreta', 401);
  }

  user.password = newPassword;
  await user.save();

  res.json({ message: 'Senha atualizada com sucesso' });
});

const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, bio } = req.body;

  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ErrorResponse('Usuário não encontrado', 404);
  }

  if (name) {
    if (name.length < 2 || name.length > 100) {
      throw new ErrorResponse('Nome deve ter entre 2 e 100 caracteres', 400);
    }
    user.name = name;
  }

  if (phone !== undefined) {
    if (phone && !/^\+?[\d\s-()]+$/.test(phone)) {
      throw new ErrorResponse('Número de telefone inválido', 400);
    }
    user.phone = phone;
  }

  if (bio !== undefined) {
    if (bio && bio.length > 500) {
      throw new ErrorResponse('Biografia deve ter no máximo 500 caracteres', 400);
    }
    user.bio = bio;
  }

  const updatedUser = await user.save();

  res.json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    phone: updatedUser.phone,
    bio: updatedUser.bio,
    role: updatedUser.role
  });
});

const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id,
      role: user.role,
      email: user.email
    }, 
    process.env.JWT_SECRET, 
    {
      expiresIn: process.env.JWT_EXPIRE || '24h',
      audience: 'resolveai-app',
      issuer: 'resolveai-api'
    }
  );
};

const generateRefreshToken = (user) => {

  const refreshSecret = process.env.REFRESH_TOKEN_SECRET || (process.env.JWT_SECRET + '_refresh');
  
  return jwt.sign(
    { id: user._id }, 
    refreshSecret,
    { 
      expiresIn: process.env.REFRESH_TOKEN_EXPIRE || '7d',
      audience: 'resolveai-app',
      issuer: 'resolveai-api'
    }
  );
};

const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new ErrorResponse('Refresh token é obrigatório', 400);
  }

  const refreshSecret = process.env.REFRESH_TOKEN_SECRET || (process.env.JWT_SECRET + '_refresh');
  
  try {

    let decoded;
    try {

      decoded = jwt.verify(
        refreshToken, 
        refreshSecret,
        {
          audience: 'resolveai-app',
          issuer: 'resolveai-api'
        }
      );
    } catch (verifyError) {

      decoded = jwt.verify(
        refreshToken, 
        refreshSecret
      );
      console.log('Refresh token verificado em modo de compatibilidade');
    }

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      throw new ErrorResponse('Usuário não encontrado', 404);
    }

    const newAccessToken = generateToken(user);
    const newRefreshToken = generateRefreshToken(user);

    res.json({
      token: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    console.error('Erro ao renovar token:', error.name, error.message);
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      throw new ErrorResponse('Refresh token inválido ou expirado', 401);
    }
    throw error;
  }
});

module.exports = {
  register,
  login,
  getMe,
  updatePassword,
  updateProfile,
  refreshToken
};