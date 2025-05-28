const express = require('express');
const cors = require('cors');
const { Pool } = require('pg'); // Added for PostgreSQL
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// 미들웨어
app.use(cors());
app.use(express.json());

// PostgreSQL 연결
const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

pool.connect()
  .then(() => console.log('PostgreSQL 연결 성공'))
  .catch(err => console.error('PostgreSQL 연결 실패:', err));

// 라우트
const categoryRoutes = require('./src/routes/categoryRoutes'); // Import category routes
app.use(categoryRoutes); // Register category routes

const tagRoutes = require('./src/routes/tagRoutes'); // Import tag routes
app.use(tagRoutes); // Register tag routes

const promptRoutes = require('./src/routes/promptRoutes'); // Import prompt routes
app.use(promptRoutes); // Register prompt routes

app.get('/', (req, res) => {
  res.json({ message: '바이브 코딩 프롬프트 가이드 API' });
});

// 서버 시작
// 테스트 환경이 아닐 때만 서버를 시작합니다.
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
  });
}

module.exports = { app, pool }; // Export app and pool