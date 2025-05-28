const request = require('supertest');
const { app, pool } = require('../../server');

// Mock the pg module
jest.mock('pg'); // Uses backend/__mocks__/pg.js

describe('Prompt API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // The prompt controller uses a client from pool.connect() for transactions.
    // So, we need to ensure the mock for pool.connect().query is reset.
    // The mock structure in __mocks__/pg.js is:
    // pool.connect().mockResolvedValue({ query: jest.fn(), release: jest.fn() })
    // pool.query is also a jest.fn()
    pool.query.mockReset();
    if (pool.connect.mockImplementation) { // if connect itself is a mock function
        pool.connect.mockImplementation(() => Promise.resolve({
            query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }), // Default mock for client.query
            release: jest.fn(),
        }));
    } else { // If pool.connect is not a mock function but returns a mock, reset its internal mocks
        const mockClientQuery = pool.connect().query; // This assumes connect() returns the mock client structure
        if(mockClientQuery && mockClientQuery.mockReset) mockClientQuery.mockReset();
    }
  });

  describe('GET /api/prompts', () => {
    it('should fetch all prompts with categories and tags', async () => {
      const mockPrompts = [
        { id: 1, title: 'Prompt 1', category_id: 1, category_name: 'Category 1' },
        { id: 2, title: 'Prompt 2', category_id: 2, category_name: 'Category 2' },
      ];
      const mockTagsForPrompt1 = [{ id: 1, name: 'Tag1' }];
      const mockTagsForPrompt2 = [{ id: 2, name: 'Tag2' }];

      // Mock for fetching prompts
      pool.query.mockResolvedValueOnce({ rows: mockPrompts });
      // Mock for fetching tags for prompt 1
      pool.query.mockResolvedValueOnce({ rows: mockTagsForPrompt1 });
      // Mock for fetching tags for prompt 2
      pool.query.mockResolvedValueOnce({ rows: mockTagsForPrompt2 });

      const response = await request(app).get('/api/prompts');

      expect(response.statusCode).toBe(200);
      expect(response.body.length).toBe(2);
      expect(response.body[0].title).toBe('Prompt 1');
      expect(response.body[0].tags).toEqual(mockTagsForPrompt1);
      expect(response.body[1].title).toBe('Prompt 2');
      expect(response.body[1].tags).toEqual(mockTagsForPrompt2);

      expect(pool.query).toHaveBeenNthCalledWith(1, expect.stringContaining('SELECT p.*, c.name as category_name'));
      expect(pool.query).toHaveBeenNthCalledWith(2, expect.stringContaining('SELECT t.id, t.name'), [1]);
      expect(pool.query).toHaveBeenNthCalledWith(3, expect.stringContaining('SELECT t.id, t.name'), [2]);
    });

    it('should return 500 if there is a database error fetching prompts', async () => {
      pool.query.mockRejectedValueOnce(new Error('DB error fetching prompts'));
      const response = await request(app).get('/api/prompts');
      expect(response.statusCode).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });
  });

  describe('GET /api/prompts/:id', () => {
    it('should fetch a specific prompt with category and tags', async () => {
      const mockPrompt = { id: 1, title: 'Prompt 1', category_id: 1, category_name: 'Category 1' };
      const mockTags = [{ id: 1, name: 'Tag1' }];
      pool.query.mockResolvedValueOnce({ rows: [mockPrompt] }); // Fetch prompt
      pool.query.mockResolvedValueOnce({ rows: mockTags });     // Fetch tags

      const response = await request(app).get('/api/prompts/1');

      expect(response.statusCode).toBe(200);
      expect(response.body.title).toBe('Prompt 1');
      expect(response.body.tags).toEqual(mockTags);
      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('WHERE p.id = $1'), [ '1' ]);
      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('WHERE pt.prompt_id = $1'), [1]);

    });

    it('should return 404 if prompt not found', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] }); // Prompt not found
      const response = await request(app).get('/api/prompts/999');
      expect(response.statusCode).toBe(404);
      expect(response.body).toEqual({ error: 'Prompt not found' });
    });
  });

  describe('POST /api/prompts', () => {
    const promptPayload = {
      title: 'New Test Prompt',
      description: 'A description',
      content: 'This is the prompt content.',
      category_id: 1,
      tags: ['newTag', 'existingTag'],
    };
    const mockCreatedPromptRow = { id: 100, ...promptPayload, user_id: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    const mockCategory = { id: 1, name: 'Test Category' };
    const mockNewTag = { id: 5, name: 'newTag' };
    const mockExistingTag = { id: 6, name: 'existingTag' };

    let mockClient;

    beforeEach(() => {
        mockClient = {
            query: jest.fn(),
            release: jest.fn(),
        };
        pool.connect.mockResolvedValue(mockClient); // Ensure pool.connect() returns our mockClient for transactions
    });

    it('should create a new prompt successfully with new and existing tags', async () => {
      // Transaction start
      mockClient.query.mockResolvedValueOnce(undefined); // BEGIN
      // Insert into prompts
      mockClient.query.mockResolvedValueOnce({ rows: [mockCreatedPromptRow], rowCount: 1 }); // INSERT prompt
      
      // getTagIds logic (now uses client.query):
      // 1. 'newTag' - check if exists
      mockClient.query.mockResolvedValueOnce({ rows: [] }); // 'newTag' does not exist (SELECT id FROM tags WHERE name = 'newTag')
      // 2. 'newTag' - insert
      mockClient.query.mockResolvedValueOnce({ rows: [mockNewTag] }); // INSERT 'newTag' (INSERT INTO tags (name) VALUES ('newTag') RETURNING id)
      // 3. 'existingTag' - check if exists
      mockClient.query.mockResolvedValueOnce({ rows: [mockExistingTag] }); // 'existingTag' exists (SELECT id FROM tags WHERE name = 'existingTag')

      // Insert into prompt_tags for 'newTag'
      mockClient.query.mockResolvedValueOnce({ rows: [], rowCount: 1 }); // INSERT prompt_tags for newTag
      // Insert into prompt_tags for 'existingTag'
      mockClient.query.mockResolvedValueOnce({ rows: [], rowCount: 1 }); // INSERT prompt_tags for existingTag
      
      // Transaction commit
      mockClient.query.mockResolvedValueOnce(undefined); // COMMIT

      // Refetch logic after commit
      // Refetch prompt with category
      pool.query.mockResolvedValueOnce({ rows: [{...mockCreatedPromptRow, category_name: mockCategory.name }] });
      // Refetch tags for the prompt
      pool.query.mockResolvedValueOnce({ rows: [mockNewTag, mockExistingTag] });


      const response = await request(app)
        .post('/api/prompts')
        .send(promptPayload);

      expect(response.statusCode).toBe(201);
      expect(response.body.title).toBe(promptPayload.title);
      expect(response.body.category_name).toBe(mockCategory.name);
      expect(response.body.tags).toEqual(expect.arrayContaining([mockNewTag, mockExistingTag]));

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      // Call 1: BEGIN
      // Call 2: INSERT prompt
      expect(mockClient.query).toHaveBeenNthCalledWith(2, expect.stringContaining('INSERT INTO prompts'), expect.any(Array));
      
      // getTagIds calls client.query now
      // Call 3: Check 'newTag'
      expect(mockClient.query).toHaveBeenNthCalledWith(3, 'SELECT id FROM tags WHERE name = $1', ['newTag']);
      // Call 4: Insert 'newTag'
      expect(mockClient.query).toHaveBeenNthCalledWith(4, 'INSERT INTO tags (name) VALUES ($1) RETURNING id', ['newTag']);
      // Call 5: Check 'existingTag'
      expect(mockClient.query).toHaveBeenNthCalledWith(5, 'SELECT id FROM tags WHERE name = $1', ['existingTag']);
      
      // Call 6: Insert prompt_tags for newTag
      expect(mockClient.query).toHaveBeenNthCalledWith(6, 'INSERT INTO prompt_tags (prompt_id, tag_id) VALUES ($1, $2)', [mockCreatedPromptRow.id, mockNewTag.id]);
      // Call 7: Insert prompt_tags for existingTag
      expect(mockClient.query).toHaveBeenCalledWith('INSERT INTO prompt_tags (prompt_id, tag_id) VALUES ($1, $2)', [mockCreatedPromptRow.id, mockExistingTag.id]);
      expect(mockClient.query).toHaveBeenCalledWith('INSERT INTO prompt_tags (prompt_id, tag_id) VALUES ($1, $2)', [mockCreatedPromptRow.id, mockExistingTag.id]);
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/prompts')
        .send({ description: 'Only description' });
      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({ error: 'Title, content, and category_id are required' });
    });

    it('should rollback transaction on database error during prompt insert', async () => {
      mockClient.query.mockResolvedValueOnce(undefined); // BEGIN
      mockClient.query.mockRejectedValueOnce(new Error('DB error on prompt insert')); // Fail INSERT prompt
      mockClient.query.mockResolvedValueOnce(undefined); // ROLLBACK

      const response = await request(app)
        .post('/api/prompts')
        .send(promptPayload);

      expect(response.statusCode).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error while creating prompt' });
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });
    
    it('should rollback transaction on database error during tag creation (getTagIds)', async () => {
        mockClient.query.mockResolvedValueOnce(undefined); // BEGIN
        mockClient.query.mockResolvedValueOnce({ rows: [mockCreatedPromptRow], rowCount: 1 }); // INSERT prompt (Call 2)
        
        // getTagIds logic (now uses client.query):
        // Call 3: 'newTag' check fails
        mockClient.query.mockRejectedValueOnce(new Error('DB error checking tag')); 
        
        // Call 4: ROLLBACK
        mockClient.query.mockResolvedValueOnce(undefined); 

        const response = await request(app)
            .post('/api/prompts')
            .send(promptPayload);

        expect(response.statusCode).toBe(500);
        expect(response.body).toEqual({ error: 'Internal server error while creating prompt' });
        expect(mockClient.query).toHaveBeenNthCalledWith(1,'BEGIN');
        // Call 3 for tag check was made on mockClient.query
        expect(mockClient.query).toHaveBeenNthCalledWith(3,'SELECT id FROM tags WHERE name = $1', ['newTag']);
        expect(mockClient.query).toHaveBeenNthCalledWith(4,'ROLLBACK');
        expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('DELETE /api/prompts/:id', () => {
    it('should delete a prompt successfully', async () => {
      pool.query.mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 1, title: 'Deleted Prompt' }] });
      const response = await request(app).delete('/api/prompts/1');
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({ message: 'Prompt deleted successfully' });
      expect(pool.query).toHaveBeenCalledWith('DELETE FROM prompts WHERE id = $1 RETURNING *', ['1']);
    });

    it('should return 404 if prompt to delete is not found', async () => {
      pool.query.mockResolvedValueOnce({ rowCount: 0 });
      const response = await request(app).delete('/api/prompts/999');
      expect(response.statusCode).toBe(404);
      expect(response.body).toEqual({ error: 'Prompt not found' });
    });
  });
  
  // Note: PUT /api/prompts/:id is complex like POST and would need similar detailed transaction mocking.
  // For brevity in this example, only a basic shell or a success case might be shown.
  describe('PUT /api/prompts/:id', () => {
    const promptUpdatePayload = {
      title: 'Updated Test Prompt',
      description: 'An updated description',
      content: 'This is the updated prompt content.',
      category_id: 2,
      tags: ['updatedTag'],
    };
    const mockUpdatedPromptRow = { id: 1, ...promptUpdatePayload, user_id: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    const mockUpdatedCategory = { id: 2, name: 'Updated Category' };
    const mockUpdatedTag = { id: 7, name: 'updatedTag' };

    let mockClient;

    beforeEach(() => {
        mockClient = {
            query: jest.fn(),
            release: jest.fn(),
        };
        pool.connect.mockResolvedValue(mockClient);
    });

    it('should update an existing prompt successfully', async () => {
        // Transaction
        mockClient.query.mockResolvedValueOnce(undefined); // BEGIN
        mockClient.query.mockResolvedValueOnce({ rows: [mockUpdatedPromptRow], rowCount: 1 }); // UPDATE prompts
        mockClient.query.mockResolvedValueOnce({ rowCount: 1 }); // DELETE FROM prompt_tags
        
        // getTagIds logic for 'updatedTag' (now uses client.query)
        // Call 4: Check 'updatedTag'
        mockClient.query.mockResolvedValueOnce({ rows: [] }); 
        // Call 5: Insert 'updatedTag'
        mockClient.query.mockResolvedValueOnce({ rows: [mockUpdatedTag] }); 
        
        // Call 6: INSERT INTO prompt_tags for 'updatedTag'
        mockClient.query.mockResolvedValueOnce({ rowCount: 1 }); 
        // Call 7: COMMIT
        mockClient.query.mockResolvedValueOnce(undefined); 

        // Refetch logic
        pool.query.mockResolvedValueOnce({ rows: [{ ...mockUpdatedPromptRow, category_name: mockUpdatedCategory.name }] }); // Refetch prompt
        pool.query.mockResolvedValueOnce({ rows: [mockUpdatedTag] }); // Refetch tags

        const response = await request(app)
            .put('/api/prompts/1')
            .send(promptUpdatePayload);

        expect(response.statusCode).toBe(200);
        expect(response.body.title).toBe(promptUpdatePayload.title);
        expect(response.body.tags).toEqual([mockUpdatedTag]);
        
        // Call 1: BEGIN
        expect(mockClient.query).toHaveBeenNthCalledWith(1, 'BEGIN');
        // Call 2: UPDATE prompts
        expect(mockClient.query).toHaveBeenNthCalledWith(2, expect.stringContaining('UPDATE prompts SET title = $1'), expect.any(Array));
        // Call 3: DELETE FROM prompt_tags
        expect(mockClient.query).toHaveBeenNthCalledWith(3, 'DELETE FROM prompt_tags WHERE prompt_id = $1', [ '1' ]);
        
        // getTagIds calls client.query now
        // Call 4: Check 'updatedTag'
        expect(mockClient.query).toHaveBeenNthCalledWith(4, 'SELECT id FROM tags WHERE name = $1', ['updatedTag']);
        // Call 5: Insert 'updatedTag'
        expect(mockClient.query).toHaveBeenNthCalledWith(5, 'INSERT INTO tags (name) VALUES ($1) RETURNING id', ['updatedTag']);
        
        // Call 6: Insert prompt_tags for updatedTag
        expect(mockClient.query).toHaveBeenNthCalledWith(6, 'INSERT INTO prompt_tags (prompt_id, tag_id) VALUES ($1, $2)', [mockUpdatedPromptRow.id, mockUpdatedTag.id]);
        // Call 7: COMMIT
        expect(mockClient.query).toHaveBeenNthCalledWith(7, 'COMMIT');
        expect(mockClient.release).toHaveBeenCalled();
    });
    
    it('should return 404 if prompt to update is not found', async () => {
        mockClient.query.mockResolvedValueOnce(undefined); // BEGIN
        mockClient.query.mockResolvedValueOnce({ rows: [], rowCount: 0 }); // UPDATE prompts - not found
        mockClient.query.mockResolvedValueOnce(undefined); // ROLLBACK (implied, controller handles this)

        const response = await request(app)
            .put('/api/prompts/999')
            .send(promptUpdatePayload);
        
        expect(response.statusCode).toBe(404);
        expect(response.body).toEqual({ error: 'Prompt not found' });
        expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
        // The controller should call ROLLBACK if the initial update returns no rows.
        // The mock for ROLLBACK would be the next call to mockClient.query after the failed UPDATE.
        // Check if rollback was called
        expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
        expect(mockClient.release).toHaveBeenCalled();
    });
  });

});
