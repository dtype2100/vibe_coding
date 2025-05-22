-- 사용자 테이블
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 카테고리 테이블
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 태그 테이블
CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 프롬프트 테이블
CREATE TABLE prompts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    category_id INTEGER REFERENCES categories(id),
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 프롬프트-태그 연결 테이블
CREATE TABLE prompt_tags (
    prompt_id INTEGER REFERENCES prompts(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (prompt_id, tag_id)
);

-- 초기 카테고리 데이터
INSERT INTO categories (name, description) VALUES
    ('웹 개발', '웹 애플리케이션 개발 관련 프롬프트'),
    ('데이터 과학', '데이터 분석 및 시각화 관련 프롬프트'),
    ('AI/ML', '인공지능 및 머신러닝 관련 프롬프트'),
    ('모바일 개발', '모바일 애플리케이션 개발 관련 프롬프트'),
    ('게임 개발', '게임 개발 관련 프롬프트');

-- 초기 태그 데이터
INSERT INTO tags (name) VALUES
    ('React'), ('Node.js'), ('Python'), ('TensorFlow'), ('웹 개발'),
    ('데이터 분석'), ('시각화'), ('머신러닝'), ('AI'), ('TypeScript'),
    ('JavaScript'), ('Django'), ('Flask'), ('SQL'), ('NoSQL'),
    ('Docker'), ('Kubernetes'), ('AWS'), ('Azure'), ('GCP'); 