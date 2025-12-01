const User = require('../models/User');
const Report = require('../models/Report');
const asyncHandler = require('express-async-handler');
const ErrorResponse = require('../utils/errorResponse');
const { validateEmail } = require('../utils/validation');

const getUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  const query = {};

  if (req.query.role) {
    query.role = req.query.role;
  }
  if (req.query.search) {
    query.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  const total = await User.countDocuments(query);
  const users = await User.find(query)
    .select('-password -__v')
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(limit);

  res.json({
    users,
    page,
    pages: Math.ceil(total / limit),
    total
  });
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('-password -__v');

  if (!user) {
    throw new ErrorResponse('Usuário não encontrado', 404);
  }

  res.json(user);
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new ErrorResponse('Usuário não encontrado', 404);
  }

  if (req.body.email && !validateEmail(req.body.email)) {
    throw new ErrorResponse('Email inválido', 400);
  }

  if (req.body.email && req.body.email !== user.email) {
    const emailExists = await User.findOne({ email: req.body.email });
    if (emailExists) {
      throw new ErrorResponse('Email já está em uso', 400);
    }
  }

  if (req.body.role && !['user', 'admin'].includes(req.body.role)) {
    throw new ErrorResponse('Papel inválido', 400);
  }

  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
    phone: req.body.phone,
    bio: req.body.bio
  };

  Object.keys(fieldsToUpdate).forEach(key => 
    fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
  );

  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    fieldsToUpdate,
    { new: true, runValidators: true }
  ).select('-password -__v');

  res.json(updatedUser);
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new ErrorResponse('Usuário não encontrado', 404);
  }

  const activeReports = await Report.find({
    organizer: user._id,
    status: 'active'
  });

  if (activeReports.length > 0) {
    throw new ErrorResponse(
      'Não é possível deletar usuário com relatos ativos',
      400
    );
  }

  await user.deleteOne();

  res.json({
    success: true,
    message: 'Usuário deletado com sucesso'
  });
});

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  deleteUser
};