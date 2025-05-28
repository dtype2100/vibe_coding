const { pool } = require('../../server');

// Helper function to get or create tag IDs, now using a transaction client
const getTagIds = async (tags, client) => { // Added client parameter
  const tagIds = [];
  for (const tagNameOrId of tags) {
    if (typeof tagNameOrId === 'number') {
      tagIds.push(tagNameOrId);
    } else if (typeof tagNameOrId === 'string') {
      // Use client.query instead of pool.query
      let tagResult = await client.query('SELECT id FROM tags WHERE name = $1', [tagNameOrId]);
      if (tagResult.rows.length > 0) {
        tagIds.push(tagResult.rows[0].id);
      } else {
        // If tag name not found, create it using the transaction client
        tagResult = await client.query('INSERT INTO tags (name) VALUES ($1) RETURNING id', [tagNameOrId]);
        tagIds.push(tagResult.rows[0].id);
      }
    }
  }
  return tagIds;
};

const getAllPrompts = async (req, res) => {
  try {
    const promptQuery = `
      SELECT p.*, c.name as category_name 
      FROM prompts p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.created_at DESC;
    `;
    const promptsResult = await pool.query(promptQuery);
    const prompts = promptsResult.rows;

    for (const prompt of prompts) {
      const tagsQuery = `
        SELECT t.id, t.name 
        FROM tags t
        JOIN prompt_tags pt ON t.id = pt.tag_id
        WHERE pt.prompt_id = $1;
      `;
      const tagsResult = await pool.query(tagsQuery, [prompt.id]);
      prompt.tags = tagsResult.rows;
    }

    res.status(200).json(prompts);
  } catch (error) {
    console.error('Error fetching all prompts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getPromptById = async (req, res) => {
  const { id } = req.params;
  try {
    const promptQuery = `
      SELECT p.*, c.name as category_name 
      FROM prompts p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = $1;
    `;
    const promptResult = await pool.query(promptQuery, [id]);

    if (promptResult.rows.length === 0) {
      return res.status(404).json({ error: 'Prompt not found' });
    }
    const prompt = promptResult.rows[0];

    const tagsQuery = `
      SELECT t.id, t.name 
      FROM tags t
      JOIN prompt_tags pt ON t.id = pt.tag_id
      WHERE pt.prompt_id = $1;
    `;
    const tagsResult = await pool.query(tagsQuery, [id]);
    prompt.tags = tagsResult.rows;

    res.status(200).json(prompt);
  } catch (error) {
    console.error(`Error fetching prompt ${id}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createPrompt = async (req, res) => {
  const { title, description, content, category_id, user_id = null, tags = [] } = req.body;

  if (!title || !content || !category_id) {
    return res.status(400).json({ error: 'Title, content, and category_id are required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const promptInsertQuery = `
      INSERT INTO prompts (title, description, content, category_id, user_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const promptResult = await client.query(promptInsertQuery, [title, description, content, category_id, user_id]);
    const newPrompt = promptResult.rows[0];

    if (tags && tags.length > 0) {
      // Pass the client to getTagIds
      const tagIds = await getTagIds(tags, client); 
      for (const tagId of tagIds) {
        await client.query('INSERT INTO prompt_tags (prompt_id, tag_id) VALUES ($1, $2)', [newPrompt.id, tagId]);
      }
    }

    await client.query('COMMIT');
    
    // Refetch the prompt with category and tags for response
    const finalPromptQuery = `
      SELECT p.*, c.name as category_name 
      FROM prompts p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = $1;
    `;
    const finalPromptResult = await pool.query(finalPromptQuery, [newPrompt.id]); // Use pool here, not client
    const finalPrompt = finalPromptResult.rows[0];

    const finalTagsQuery = `
        SELECT t.id, t.name 
        FROM tags t
        JOIN prompt_tags pt ON t.id = pt.tag_id
        WHERE pt.prompt_id = $1;
      `;
    const finalTagsResult = await pool.query(finalTagsQuery, [newPrompt.id]); // Use pool here
    finalPrompt.tags = finalTagsResult.rows;

    res.status(201).json(finalPrompt);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating prompt:', error);
    // Check if the error is from getTagIds and involves pool within transaction
    // This specific console error check might be less relevant now, but general error handling remains.
    // if (error.message.includes("pool.query") && client.active) { 
    //     console.error("Potential issue: getTagIds might need to use the transaction client.");
    // }
    res.status(500).json({ error: 'Internal server error while creating prompt' });
  } finally {
    client.release();
  }
};

const updatePrompt = async (req, res) => {
  const { id } = req.params;
  const { title, description, content, category_id, user_id, tags = [] } = req.body;

  if (!title || !content || !category_id) {
    return res.status(400).json({ error: 'Title, content, and category_id are required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const promptUpdateQuery = `
      UPDATE prompts
      SET title = $1, description = $2, content = $3, category_id = $4, user_id = $5, updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *;
    `;
    const promptResult = await client.query(promptUpdateQuery, [title, description, content, category_id, user_id, id]);

    if (promptResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Prompt not found' });
    }
    const updatedPrompt = promptResult.rows[0];

    // Remove old tags
    await client.query('DELETE FROM prompt_tags WHERE prompt_id = $1', [id]);

    // Add new tags
    if (tags && tags.length > 0) {
      // Pass the client to getTagIds
      const tagIds = await getTagIds(tags, client); 
       for (const tagId of tagIds) {
        await client.query('INSERT INTO prompt_tags (prompt_id, tag_id) VALUES ($1, $2)', [updatedPrompt.id, tagId]);
      }
    }
    
    await client.query('COMMIT');

    // Refetch the prompt with category and tags for response
    const finalPromptQuery = `
      SELECT p.*, c.name as category_name 
      FROM prompts p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = $1;
    `;
    const finalPromptResult = await pool.query(finalPromptQuery, [updatedPrompt.id]); // Use pool here
    const finalPrompt = finalPromptResult.rows[0];

    const finalTagsQuery = `
        SELECT t.id, t.name 
        FROM tags t
        JOIN prompt_tags pt ON t.id = pt.tag_id
        WHERE pt.prompt_id = $1;
      `;
    const finalTagsResult = await pool.query(finalTagsQuery, [updatedPrompt.id]); // Use pool here
    finalPrompt.tags = finalTagsResult.rows;

    res.status(200).json(finalPrompt);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`Error updating prompt ${id}:`, error);
    res.status(500).json({ error: 'Internal server error while updating prompt' });
  } finally {
    client.release();
  }
};

const deletePrompt = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM prompts WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Prompt not found' });
    }
    // ON DELETE CASCADE in schema.sql handles deleting from prompt_tags
    res.status(200).json({ message: 'Prompt deleted successfully' });
  } catch (error) {
    console.error(`Error deleting prompt ${id}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAllPrompts,
  getPromptById,
  createPrompt,
  updatePrompt,
  deletePrompt,
};
