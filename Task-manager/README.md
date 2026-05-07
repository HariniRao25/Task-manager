# Team Task Manager (MERN)

Production-style Team Task Manager built with React + Vite, Node + Express, MongoDB, JWT auth, bcrypt password hashing, and role-based access control.

Features

- JWT signup/login with Admin and Member roles
- Protected dashboard routes and persistent local auth state
- Project CRUD for admins
- Task CRUD, assignment, status updates, search, and filtering
- MongoDB relationships with Mongoose ObjectId references
- Responsive dashboard UI with sidebar, navbar, cards, charts, and loading states
- Toast notifications, validation, and member-aware forms

Setup

1. Install and run MongoDB locally or set `MONGO_URI` in `.env`.
	The local default connection is `mongodb://localhost:27017/sa`.
	The backend default port is `5001`.
2. Copy the example environment files:

```bash
copy .env.example .env
copy server\.env.example server\.env
```

3. Start the backend:

```bash
cd server
npm install
npm run dev
```

4. Start the frontend:

```bash
cd client
npm install
npm run dev
```

Environment

- `server/.env`: `PORT` (default: `5001`), `MONGO_URI` (default: `mongodb://localhost:27017/sa`), `JWT_SECRET`, `JWT_EXPIRES_IN`
- `client/.env`: `VITE_API_URL=http://localhost:5001/api`

API testing examples

```bash
curl -X POST http://localhost:5001/api/auth/signup -H "Content-Type: application/json" -d "{\"name\":\"Admin User\",\"email\":\"admin@example.com\",\"password\":\"secret123\",\"role\":\"Admin\"}"
curl -X POST http://localhost:5001/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"admin@example.com\",\"password\":\"secret123\"}"
curl http://localhost:5001/api/stats/summary -H "Authorization: Bearer <token>"
```

Key endpoints

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/:id`
- `GET /api/tasks`
- `POST /api/tasks`
- `GET /api/stats/summary`
- `GET /api/users` (admin-only)

