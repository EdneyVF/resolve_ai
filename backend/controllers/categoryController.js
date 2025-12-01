const Category = require('../models/Category');
const Report = require('../models/Report');
const asyncHandler = require('express-async-handler');
const ErrorResponse = require('../utils/errorResponse');

const getCategories = asyncHandler(async (req, res) => {

  const filter = {};

  if (!req.user || req.user.role !== 'admin') {
    filter.active = true;
  }

  const categories = await Category.find(filter).sort({ name: 1 });
  
  res.json(categories);
});

const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  
  if (!category) {
    throw new ErrorResponse('Categoria não encontrada', 404);
  }

  if (!category.active && (!req.user || req.user.role !== 'admin')) {
    throw new ErrorResponse('Categoria não encontrada', 404);
  }
  
  res.json(category);
});

const createCategory = asyncHandler(async (req, res) => {
  const { name, description, active } = req.body;

  const existingCategory = await Category.findOne({ name });
  if (existingCategory) {
    throw new ErrorResponse('Categoria com este nome já existe', 400);
  }

  const category = await Category.create({
    name,
    description,
    active: active !== undefined ? active : true
  });
  
  res.status(201).json(category);
});

const updateCategory = asyncHandler(async (req, res) => {
  const { name, description, active } = req.body;
  
  let category = await Category.findById(req.params.id);
  
  if (!category) {
    throw new ErrorResponse('Categoria não encontrada', 404);
  }

  if (name && name !== category.name) {
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      throw new ErrorResponse('Categoria com este nome já existe', 400);
    }
  }

  category = await Category.findByIdAndUpdate(
    req.params.id,
    { name, description, active },
    { new: true, runValidators: true }
  );
  
  res.json(category);
});

const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    throw new ErrorResponse('Categoria não encontrada', 404);
  }

  const reportsCount = await Report.countDocuments({ category: req.params.id });

  if (reportsCount > 0) {
    throw new ErrorResponse(`Não é possível excluir categoria com ${reportsCount} relatos associados. Considere desativá-la.`, 400);
  }

  await category.deleteOne();

  res.json({
    success: true,
    message: 'Categoria removida com sucesso'
  });
});

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
}; 