const express = require('express');
const router = express.Router();
const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');

// Define category routes
router.get('/api/categories', getAllCategories);
router.get('/api/categories/:id', getCategoryById);
router.post('/api/categories', createCategory);
router.put('/api/categories/:id', updateCategory);
router.delete('/api/categories/:id', deleteCategory);

module.exports = router;
