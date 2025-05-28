const express = require('express');
const router = express.Router();
const {
  getAllPrompts,
  getPromptById,
  createPrompt,
  updatePrompt,
  deletePrompt,
} = require('../controllers/promptController');

// Define prompt routes
router.get('/api/prompts', getAllPrompts);
router.get('/api/prompts/:id', getPromptById);
router.post('/api/prompts', createPrompt);
router.put('/api/prompts/:id', updatePrompt);
router.delete('/api/prompts/:id', deletePrompt);

module.exports = router;
