# Password Manager Backend (Node.js + Express + MongoDB)

Secure multi-user password manager backend with JWT auth, bcrypt password hashing, AES-256-CBC encryption for stored credentials, per-user data isolation, CORS, rate limiting, and audit logging.

Features
- Express + MongoDB (Mongoose)
- JSON REST API
- Security by default: helmet, rate limits, validation
- bcrypt for user passwords
- JWT for auth (Authorization: Bearer <token>)
- AES-256-CBC encryption using Node crypto
- Per-user isolation enforced on all queries
- CORS restricted to FRONTEND_URL
- Audit logging of reveal actions
- Dockerfile + docker-compose for local dev

Requirements
- Node.js 18+
- MongoDB (local or Atlas)

Environment variables
Create a .env file (do not commit) based on .env.example

- MONGODB_URI: MongoDB connection string
- JWT_SECRET: Strong secret for signing JWTs
- JWT_EXPIRES_IN: e.g., 7d
- AES_SECRET_KEY: 64 hex chars (32 bytes) for AES-256-CBC
- FRONTEND_URL: Allowed CORS origin (e.g., http://localhost:5173)

Generate secure values
- JWT_SECRET: openssl rand -hex 32
- AES_SECRET_KEY: openssl rand -hex 32 (exactly 64 hex chars)

Project structure
- src/
  - index.js
  - app.js
  - models/
  - controllers/
  - routes/
  - middleware/
  - utils/
  - validation/

Install and run
- npm install
- npm run dev (hot reload)
- npm start (production mode)

Docker
- docker-compose up --build
This starts API at http://localhost:4000 and MongoDB at localhost:27017.

API endpoints
Auth
- POST /auth/register
  - Body: { username, email, password }
  - Response: { _id, username, email, createdAt }
- POST /auth/login
  - Body: { email, password }
  - Response: { token, user: { _id, username, email } }

Credentials (protected; send Authorization: Bearer <token>)
- POST /password
  - Body: { accountName, accountUsername, passwordPlain }
  - Response: { _id, accountName, accountUsername, createdAt, updatedAt, encrypted: true }
- GET /password
  - Response: array of { _id, accountName, accountUsername, createdAt, updatedAt, encrypted: true }
- GET /password/:id/reveal
  - Response: { passwordPlain }
  - Rate limited and audited
- PUT /password/:id
  - Body: any of { accountName, accountUsername, passwordPlain }
  - Response: metadata as above
- DELETE /password/:id
  - Response: { success: true }

Example curl requests
- Register
  curl -X POST http://localhost:4000/auth/register \
    -H "Content-Type: application/json" \
    -d '{"username":"alice","email":"alice@example.com","password":"Str0ngP@ss!"}'

- Login
  curl -X POST http://localhost:4000/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"alice@example.com","password":"Str0ngP@ss!"}'

- Create credential
  curl -X POST http://localhost:4000/password \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${TOKEN}" \
    -d '{"accountName":"GitHub","accountUsername":"aliceGH","passwordPlain":"supersecret"}'

- List credentials
  curl -X GET http://localhost:4000/password \
    -H "Authorization: Bearer ${TOKEN}"

- Reveal password
  curl -X GET http://localhost:4000/password/{id}/reveal \
    -H "Authorization: Bearer ${TOKEN}"

- Update credential
  curl -X PUT http://localhost:4000/password/{id} \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${TOKEN}" \
    -d '{"passwordPlain":"newsecret"}'

- Delete credential
  curl -X DELETE http://localhost:4000/password/{id} \
    -H "Authorization: Bearer ${TOKEN}"

Security notes
- Never log decrypted passwords or secrets.
- AES_SECRET_KEY must be 64 hex chars (32 bytes).
- Token should be sent via Authorization header. Alternatively, you can use HttpOnly cookies; you must set SameSite and Secure in production.

Deployment
- Render/Railway: create a web service from this repo. Set env vars. Use start command npm start. Expose port 4000.
- MongoDB Atlas: create a free tier cluster, get MONGODB_URI, allow your service IPs.

Frontend integration
- Send Authorization: Bearer <token> on protected endpoints
- Respect CORS: set FRONTEND_URL to your frontend origin

License
MIT

