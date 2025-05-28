const request = require('supertest');
const { app, pool } = require('../../server'); // Adjust path if server.js is elsewhere

// Mock the pg module
jest.mock('pg'); // This will use ../../__mocks__/pg.js relative to this test file if not found in node_modules

describe('Category API Endpoints', () => {
  // Clear all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    // Specifically mock pool.query for each test if using the top-level query mock
    // If using pool.connect().query(), then mock that structure
    // Based on categoryController.js, it uses pool.query directly.
    pool.query.mockReset(); // Reset any previous mock implementations or return values
  });

  describe('GET /api/categories', () => {
    it('should fetch all categories successfully', async () => {
      const mockCategories = [
        { id: 1, name: 'Test Category 1', description: 'Desc 1' },
        { id: 2, name: 'Test Category 2', description: 'Desc 2' },
      ];
      pool.query.mockResolvedValueOnce({ rows: mockCategories });

      const response = await request(app).get('/api/categories');

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual(mockCategories);
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM categories');
    });

    it('should return 500 if there is a database error', async () => {
      pool.query.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app).get('/api/categories');

      expect(response.statusCode).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });
  });

  describe('GET /api/categories/:id', () => {
    it('should fetch a specific category by ID successfully', async () => {
      const mockCategory = { id: 1, name: 'Test Category 1', description: 'Desc 1' };
      pool.query.mockResolvedValueOnce({ rows: [mockCategory] });

      const response = await request(app).get('/api/categories/1');

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual(mockCategory);
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM categories WHERE id = $1', ['1']);
    });

    it('should return 404 if category not found', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app).get('/api/categories/999');

      expect(response.statusCode).toBe(404);
      expect(response.body).toEqual({ error: 'Category not found' });
    });

    it('should return 500 if there is a database error', async () => {
      pool.query.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app).get('/api/categories/1');

      expect(response.statusCode).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });
  });

  describe('POST /api/categories', () => {
    it('should create a new category successfully', async () => {
      const newCategoryData = { name: 'New Category', description: 'New Desc' };
      const createdCategory = { id: 3, ...newCategoryData };
      pool.query.mockResolvedValueOnce({ rows: [createdCategory] });

      const response = await request(app)
        .post('/api/categories')
        .send(newCategoryData);

      expect(response.statusCode).toBe(201);
      expect(response.body).toEqual(createdCategory);
      expect(pool.query).toHaveBeenCalledWith(
        'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *',
        [newCategoryData.name, newCategoryData.description]
      );
    });

    it('should create a new category successfully even if description is missing', async () => {
      const newCategoryData = { name: 'New Category No Desc' };
      // The backend will insert description as null if not provided
      const createdCategory = { id: 4, name: 'New Category No Desc', description: null }; 
      pool.query.mockResolvedValueOnce({ rows: [createdCategory] });

      const response = await request(app)
        .post('/api/categories')
        .send(newCategoryData);
      
      expect(response.statusCode).toBe(201);
      // Check if the response matches the expected structure when description is null
      expect(response.body.id).toBe(createdCategory.id);
      expect(response.body.name).toBe(createdCategory.name);
      // The actual value of description might be null or undefined depending on RETURNING * and pg driver
      // For robustness, let's check if description is either null or undefined if not provided
      expect(response.body.description === null || response.body.description === undefined).toBe(true);

      expect(pool.query).toHaveBeenCalledWith(
        'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *',
        [newCategoryData.name, undefined] // Controller passes undefined for missing description
      );
    });

    it('should return 400 if name is missing', async () => {
      const response = await request(app)
        .post('/api/categories')
        .send({ description: 'Missing name' });

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({ error: 'Name is required' });
    });

    it('should return 500 if there is a database error', async () => {
      pool.query.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app)
        .post('/api/categories')
        .send({ name: 'Error Category', description: 'Error Desc' });

      expect(response.statusCode).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });
  });

  describe('PUT /api/categories/:id', () => {
    it('should update an existing category successfully', async () => {
      const updatedData = { name: 'Updated Category', description: 'Updated Desc' };
      const updatedCategory = { id: 1, ...updatedData };
      pool.query.mockResolvedValueOnce({ rows: [updatedCategory] });

      const response = await request(app)
        .put('/api/categories/1')
        .send(updatedData);

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual(updatedCategory);
      expect(pool.query).toHaveBeenCalledWith(
        'UPDATE categories SET name = $1, description = $2 WHERE id = $3 RETURNING *',
        [updatedData.name, updatedData.description, '1']
      );
    });

    it('should return 404 if category to update is not found', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .put('/api/categories/999')
        .send({ name: 'Non Existent', description: 'Desc' });

      expect(response.statusCode).toBe(404);
      expect(response.body).toEqual({ error: 'Category not found' });
    });
    
    it('should return 400 if name is missing for update', async () => {
      const response = await request(app)
        .put('/api/categories/1')
        .send({ description: 'Missing name for update' });

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({ error: 'Name is required' });
    });

    it('should return 500 if there is a database error during update', async () => {
      pool.query.mockRejectedValueOnce(new Error('Database error'));
      const response = await request(app)
        .put('/api/categories/1')
        .send({ name: 'Error Update', description: 'Desc' });

      expect(response.statusCode).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });
  });

  describe('DELETE /api/categories/:id', () => {
    it('should delete an existing category successfully', async () => {
      // RETURNING * for DELETE in pg returns the deleted row(s)
      // If rowCount is used in controller, that's what we check for mock.
      // categoryController uses result.rowCount
      pool.query.mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 1, name: 'Deleted Category'}] });

      const response = await request(app).delete('/api/categories/1');

      expect(response.statusCode).toBe(200); // Controller sends 200 with message
      expect(response.body).toEqual({ message: 'Category deleted successfully' });
      expect(pool.query).toHaveBeenCalledWith('DELETE FROM categories WHERE id = $1 RETURNING *', ['1']);
    });

    it('should return 404 if category to delete is not found', async () => {
      pool.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });

      const response = await request(app).delete('/api/categories/999');

      expect(response.statusCode).toBe(404);
      expect(response.body).toEqual({ error: 'Category not found' });
    });
    
    it('should return 500 if there is a database error during delete', async () => {
      pool.query.mockRejectedValueOnce(new Error('Database error'));
      const response = await request(app).delete('/api/categories/1');
      
      expect(response.statusCode).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });
  });
});
