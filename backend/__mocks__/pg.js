// backend/__mocks__/pg.js
const mPool = {
  connect: jest.fn().mockResolvedValue({
    query: jest.fn(),
    release: jest.fn(),
  }), // Mock connect to return an object with query and release
  query: jest.fn(), // Mock top-level query for direct pool.query calls if any
  end: jest.fn(),
};

// Mock the Pool constructor to return our mock pool instance
const Pool = jest.fn(() => mPool);

module.exports = { Pool };
