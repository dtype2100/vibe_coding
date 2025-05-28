# 바이브 코딩 프롬프트 가이드

바이브 코딩을 위한 프롬프트 가이드 웹사이트입니다. 이 프로젝트는 개발자들이 효과적인 프롬프트를 작성하고 공유할 수 있는 플랫폼을 제공합니다.

## 주요 기능

- 프롬프트 템플릿 제공
- 프롬프트 공유 및 저장
- 카테고리별 프롬프트 검색
- 커뮤니티 기능

## 기술 스택

- Frontend: React, TypeScript
- Backend: Node.js, Express
- Database: PostgreSQL
- Styling: Tailwind CSS

## 시작하기

1.  **저장소 클론:**
    ```bash
    git clone [repository-url] # 실제 저장소 URL로 변경해주세요.
    cd vibe-coding-prompt-guide
    ```

2.  **의존성 설치:**
    프로젝트 루트 디렉토리에서 다음 명령어를 실행하여 백엔드와 프론트엔드의 모든 의존성을 설치합니다.
    ```bash
    npm run install-all
    ```

3.  **환경 변수 설정:**
    백엔드 서버는 PostgreSQL 데이터베이스 연결 및 서버 포트 설정을 위해 `.env` 파일의 환경 변수를 사용합니다.
    프로젝트의 `backend/` 디렉토리에 있는 `.env.example` 파일을 `backend/.env` 파일로 복사한 후, 실제 환경에 맞게 값을 수정해야 합니다.

    `backend/.env.example` 내용 예시:
    ```env
    # Backend server port
    PORT=5000

    # PostgreSQL connection details
    PG_HOST=localhost
    PG_USER=your_postgres_user
    PG_PASSWORD=your_postgres_password
    PG_DATABASE=vibe_coding_guide
    PG_PORT=5432
    ```
    **필수 환경 변수 목록:**
    *   `PORT`: 백엔드 API 서버가 실행될 포트 번호입니다. (기본값: 5000)
    *   `PG_HOST`: PostgreSQL 데이터베이스 서버의 호스트 주소입니다. (예: `localhost`)
    *   `PG_USER`: PostgreSQL 접속 사용자 이름입니다.
    *   `PG_PASSWORD`: PostgreSQL 접속 비밀번호입니다.
    *   `PG_DATABASE`: 사용할 데이터베이스 이름입니다. (예: `vibe_coding_guide`)
    *   `PG_PORT`: PostgreSQL 데이터베이스 서버의 포트 번호입니다. (예: `5432`)

    **`.env` 파일 생성 및 수정 방법:**
    ```bash
    cp backend/.env.example backend/.env
    # 이후 backend/.env 파일을 열어 실제 값으로 수정합니다.
    ```
    **중요:** `.env` 파일은 민감한 정보를 포함하므로, Git 버전 관리 대상에 포함되지 않도록 주의해야 합니다. (`.gitignore`에 `backend/.env`가 포함되어 있는지 확인하세요.)

4.  **데이터베이스 설정 (PostgreSQL):**
    환경 변수 설정 후, PostgreSQL 데이터베이스 및 테이블을 설정해야 합니다.
    (1) **PostgreSQL 설치 및 실행:**
        PostgreSQL 공식 웹사이트에서 사용 중인 운영체제에 맞는 설치 프로그램을 다운로드하여 설치합니다.
        설치 후 PostgreSQL 서버가 실행 중인지 확인하십시오. (예: `sudo systemctl status postgresql` 또는 macOS의 경우 `brew services list`)

    (2) **데이터베이스 생성:**
        `psql`을 사용하여 PostgreSQL에 접속한 후, 다음 명령어로 데이터베이스를 생성합니다. `PG_DATABASE` 환경 변수에 설정된 이름을 사용합니다. (예: `vibe_coding_guide`)
        ```sql
        CREATE DATABASE vibe_coding_guide; -- PG_DATABASE에 설정된 이름으로 변경
        ```
        이미 해당 이름의 데이터베이스가 있다면 이 단계를 건너뛸 수 있습니다.

    (3) **테이블 생성 (Schema 적용):**
        프로젝트 루트 디렉토리에서 다음 npm 스크립트를 실행하여 `backend/src/db/schema.sql` 파일에 정의된 테이블 구조를 데이터베이스에 적용합니다.
        이 스크립트는 `PG_USER` 및 `PG_DATABASE` 환경 변수를 사용합니다 (기본값: `postgres`, `vibe_coding_guide`).
        ```bash
        npm run db:schema
        ```
        또는 `psql`을 직접 사용하는 경우:
        ```bash
        psql -U your_postgres_user -d vibe_coding_guide -f backend/src/db/schema.sql
        ```
        (`your_postgres_user`와 `vibe_coding_guide`를 실제 값으로 변경)

    (4) **초기 데이터 삽입 (Seeding):**
        필요한 경우, `backend/src/db/seed.sql` 파일에 정의된 초기 데이터를 다음 npm 스크립트를 통해 데이터베이스에 삽입할 수 있습니다.
        ```bash
        npm run db:seed
        ```
        또는 `psql`을 직접 사용하는 경우:
        ```bash
        psql -U your_postgres_user -d vibe_coding_guide -f backend/src/db/seed.sql
        ```
    **참고:** `npm run db:schema` 및 `npm run db:seed` 스크립트 실행 시 `PGPASSWORD` 환경 변수를 미리 설정하거나, `.pgpass` 파일을 설정하면 비밀번호 입력을 자동화할 수 있습니다. (`.pgpass` 파일 형식: `hostname:port:database:username:password`)

5.  **개발 서버 실행:**
    프로젝트 루트 디렉토리에서 다음 명령어를 실행하면 백엔드 서버와 프론트엔드 개발 서버가 동시에 시작됩니다.
    ```bash
    npm run dev
    ```
    *   백엔드 API 서버: `http://localhost:{PORT}` (PORT는 `.env` 파일에서 설정한 값, 기본 5000)
    *   프론트엔드 React 앱: `http://localhost:3000` (일반적인 React 개발 서버 포트)

## 주요 API 엔드포인트

API는 `/api` 경로를 기본으로 사용합니다.

### 카테고리 API (`/api/categories`)
*   `GET /`: 모든 카테고리 목록을 조회합니다.
*   `GET /:id`: 지정된 ID의 특정 카테고리 정보를 조회합니다.
*   `POST /`: 새 카테고리를 생성합니다. 요청 바디에 `name` (필수)과 `description` (선택)을 포함합니다.
*   `PUT /:id`: 지정된 ID의 카테고리 정보를 수정합니다. 요청 바디에 `name` (필수)과 `description` (선택)을 포함합니다.
*   `DELETE /:id`: 지정된 ID의 카테고리를 삭제합니다.

### 태그 API (`/api/tags`)
*   `GET /`: 모든 태그 목록을 조회합니다.
*   `GET /:id`: 지정된 ID의 특정 태그 정보를 조회합니다.
*   `POST /`: 새 태그를 생성합니다. 요청 바디에 `name` (필수)을 포함합니다.
*   `PUT /:id`: 지정된 ID의 태그 정보를 수정합니다. 요청 바디에 `name` (필수)을 포함합니다.
*   `DELETE /:id`: 지정된 ID의 태그를 삭제합니다.

### 프롬프트 API (`/api/prompts`)
*   `GET /`: 모든 프롬프트 목록을 조회합니다. 각 프롬프트에는 연관된 카테고리 이름과 태그 목록이 포함됩니다.
*   `GET /:id`: 지정된 ID의 특정 프롬프트 정보를 조회합니다. 카테고리 이름과 태그 목록이 포함됩니다.
*   `POST /`: 새 프롬프트를 생성합니다. 요청 바디에 `title` (필수), `content` (필수), `category_id` (필수), `description` (선택), `tags` (선택, 태그 이름 또는 ID의 배열) 등을 포함합니다.
*   `PUT /:id`: 지정된 ID의 프롬프트 정보를 수정합니다. POST와 유사한 요청 바디 구조를 사용합니다.
*   `DELETE /:id`: 지정된 ID의 프롬프트를 삭제합니다.

## 프로젝트 구조

```
vibe-coding-prompt-guide/
├── frontend/          # React 프론트엔드
├── backend/           # Express 백엔드
├── package.json       # 프로젝트 설정
└── README.md         # 프로젝트 문서
``` 
