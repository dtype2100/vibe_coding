const request = require('supertest');
const { app, pool } = require('../../server');

// Mock the pg module
jest.mock('pg'); // Uses backend/__mocks__/pg.js

describe('Tag API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    pool.query.mockReset(); // Reset mock for each test
  });

  describe('GET /api/tags', () => {
    it('should fetch all tags successfully', async () => {
      const mockTags = [
        { id: 1, name: 'JavaScript' },
        { id: 2, name: 'Python' },
      ];
      pool.query.mockResolvedValueOnce({ rows: mockTags });

      const response = await request(app).get('/api/tags');

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual(mockTags);
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM tags');
    });

    it('should return 500 if there is a database error', async () => {
      pool.query.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app).get('/api/tags');

      expect(response.statusCode).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });
  });

  describe('GET /api/tags/:id', () => {
    it('should fetch a specific tag by ID successfully', async () => {
      const mockTag = { id: 1, name: 'JavaScript' };
      pool.query.mockResolvedValueOnce({ rows: [mockTag] });

      const response = await request(app).get('/api/tags/1');

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual(mockTag);
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM tags WHERE id = $1', ['1']);
    });

    it('should return 404 if tag not found', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app).get('/api/tags/999');

      expect(response.statusCode).toBe(404);
      expect(response.body).toEqual({ error: 'Tag not found' });
    });

    it('should return 500 if there is a database error', async () => {
      pool.query.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app).get('/api/tags/1');

      expect(response.statusCode).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });
  });

  describe('POST /api/tags', () => {
    it('should create a new tag successfully', async () => {
      const newTagData = { name: 'TypeScript' };
      const createdTag = { id: 3, ...newTagData };
      pool.query.mockResolvedValueOnce({ rows: [createdTag] });

      const response = await request(app)
        .post('/api/tags')
        .send(newTagData);

      expect(response.statusCode).toBe(201);
      expect(response.body).toEqual(createdTag);
      expect(pool.query).toHaveBeenCalledWith(
        'INSERT INTO tags (name) VALUES ($1) RETURNING *',
        [newTagData.name]
      );
    });

    it('should return 400 if name is missing', async () => {
      const response = await request(app)
        .post('/api/tags')
        .send({});

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({ error: 'Name is required' });
    });

    it('should return 500 if there is a database error', async () => {
      pool.query.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app)
        .post('/api/tags')
        .send({ name: 'Error Tag' });

      expect(response.statusCode).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });
  });

  describe('PUT /api/tags/:id', () => {
    it('should update an existing tag successfully', async () => {
      const updatedData = { name: 'JavaScript ES2021' };
      const updatedTag = { id: 1, ...updatedData };
      pool.query.mockResolvedValueOnce({ rows: [updatedTag] });

      const response = await request(app)
        .put('/api/tags/1')
        .send(updatedData);

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual(updatedTag);
      expect(pool.query).toHaveBeenCalledWith(
        'UPDATE tags SET name = $1 WHERE id = $2 RETURNING *',
        [updatedData.name, '1']
      );
    });

    it('should return 404 if tag to update is not found', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .put('/api/tags/999')
        .send({ name: 'Non Existent' });

      expect(response.statusCode).toBe(404);
      expect(response.body).toEqual({ error: 'Tag not found' });
    });
    
    it('should return 400 if name is missing for update', async () => {
      const response = await request(app)
        .put('/api/tags/1')
        .send({});

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({ error: 'Name is required' });
    });

    it('should return 500 if there is a database error during update', async () => {
      pool.query.mockRejectedValueOnce(new Error('Database error'));
      const response = await request(app)
        .put('/api/tags/1')
        .send({ name: 'Error Update' });

      expect(response.statusCode).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });
  });

  describe('DELETE /api/tags/:id', () => {
    it('should delete an existing tag successfully', async () => {
      pool.query.mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 1, name: 'Deleted Tag'}] });

      const response = await request(app).delete('/api/tags/1');

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({ message: 'Tag deleted successfully' });
      expect(pool.query).toHaveBeenCalledWith('DELETE FROM tags WHERE id = $1 RETURNING *', ['1']);
    });

    it('should return 404 if tag to delete is not found', async () => {
      pool.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });

      const response = await request(app).delete('/api/tags/999');

      expect(response.statusCode).toBe(404);
      expect(response.body).toEqual({ error: 'Tag not found' });
    });
    
    it('should return 500 if there is a database error during delete', async () => {
      pool.query.mockRejectedValueOnce(new Error('Database error'));
      const response = await request(app).delete('/api/tags/1');
      
      expect(response.statusCode).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });
  });
});
