const express = require('express');
const router = express.Router();
const { protect, admin, optionalAuth } = require('../middlewares/authMiddleware');
const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');

router.route('/').get(optionalAuth, getCategories);
router.route('/:id').get(optionalAuth, getCategoryById);

router.route('/').post(protect, admin, createCategory);
router.route('/:id')
  .put(protect, admin, updateCategory)
  .delete(protect, admin, deleteCategory);

module.exports = router; 