const { pool } = require('../../server'); // Adjust the path if server.js is located elsewhere

// Get all tags
const getAllTags = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tags');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get tag by ID
const getTagById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM tags WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tag not found' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(`Error fetching tag ${id}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create a new tag
const createTag = async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO tags (name) VALUES ($1) RETURNING *',
      [name]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating tag:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update a tag
const updateTag = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  try {
    const result = await pool.query(
      'UPDATE tags SET name = $1 WHERE id = $2 RETURNING *',
      [name, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tag not found' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(`Error updating tag ${id}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a tag
const deleteTag = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM tags WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) { // Check if any row was deleted
      return res.status(404).json({ error: 'Tag not found' });
    }
    res.status(200).json({ message: 'Tag deleted successfully' }); // Or res.status(204).send();
  } catch (error) {
    console.error(`Error deleting tag ${id}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAllTags,
  getTagById,
  createTag,
  updateTag,
  deleteTag,
};
