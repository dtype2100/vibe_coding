const express = require('express');
const router = express.Router();
const {
  getAllTags,
  getTagById,
  createTag,
  updateTag,
  deleteTag,
} = require('../controllers/tagController');

// Define tag routes
router.get('/api/tags', getAllTags);
router.get('/api/tags/:id', getTagById);
router.post('/api/tags', createTag);
router.put('/api/tags/:id', updateTag);
router.delete('/api/tags/:id', deleteTag);

module.exports = router;
