# Modern TODO Application (Full Stack)

A fast and secure TODO application built with **FastAPI** (Python) and **React** (TypeScript). Featuring **JWT Authentication**, **PostgreSQL** with async operations, and a polished **GSAP**-powered frontend.

## 🚀 Key Features

- ✅ **JWT Authentication**: Secure user registration and login.
- ✅ **Protected Routes**: Frontend and backend protection for user data.
- ✅ **Full CRUD**: Create, read, update, and delete TODOs tied to specific users.
- ✅ **Async Operations**: High-performance backend using SQLAlchemy async ORM.
- ✅ **Rate Limiting**: Security against brute-force and spam on API endpoints.
- ✅ **Modern UI**: Smooth animations using GSAP and responsive React design.
- ✅ **PostgreSQL Database**: Persistent storage with automatic schema management.

## 🛠 Tech Stack

### Backend
- **FastAPI**: Modern async web framework.
- **SQLAlchemy (Async)**: Powerful ORM with **asyncpg**.
- **PostgreSQL**: Production-ready relational database.
- **Pydantic v2**: Strict data validation and serialization.
- **python-jose**: JWT token handling.
- **Argon2**: Industry-leading password hashing.
- **Slowapi**: Middleware for rate limiting.

### Frontend
- **React 19**: Latest React features for a dynamic UI.
- **TypeScript**: Type safety for robust development.
- **Vite**: Ultra-fast build tool and dev server.
- **GSAP**: High-performance animations.
- **React Router 7**: Modern routing and navigation.

## 📂 Project Structure

```text
.
├── backend/                # FastAPI Application
│   ├── main.py             # Entry point & lifespan events
│   ├── app/
│   │   ├── config/         # DB & Engine config
│   │   ├── models/         # SQLAlchemy Models
│   │   ├── services/       # JWT & Hashing logic
│   │   ├── TODO/           # Todo routes & schemas
│   │   └── USER/           # User routes & schemas
│   └── .env                # Database configuration
├── frontend/               # React Application
│   ├── src/
│   │   ├── components/     # UI & Protected Routes
│   │   ├── hooks/          # Custom Auth hooks
│   │   ├── pages/          # Auth & Todo views
│   │   └── services/       # API clients (Axios/Fetch)
│   └── package.json
└── README.md
```

## ⚙️ Configuration

### Backend Setup
1. Navigate to `backend/`.
2. Create a `.env` file:
   ```env
   DATABASE_URL=postgresql+asyncpg://admin:admin@localhost:5432/todo_db
   ```
3. Install dependencies: `pip install -r requirements.txt`
4. Run server: `uvicorn main:app --reload`

### Frontend Setup
1. Navigate to `frontend/`.
2. Install dependencies: `npm install`
3. Run development server: `npm run dev`

## 🔐 Authentication Flow

1. **Signup**: `POST /api/user/signup` - Create a new user account.
2. **Signin**: `POST /api/user/signin` - Authenticate and receive a JWT.
3. **Authorization**: Include the token in the `Authorization: Bearer <token>` header for protected routes.

---

### Detailed API Reference

#### User Endpoints

##### POST `/api/user/signup`
Create a new user account
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "role": "user"
}
```
**Response** (201 Created):
```json
{
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "role": "user"
  },
  "msg": "User created."
}
```

#### POST `/api/user/signin`
Authenticate user and get JWT token
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```
**Response** (200 OK):
```json
{
  "jwt_token": "eyJhbGc...",
  "msg": "User Signed in"
}
```

### TODO Endpoints (All Protected - Require JWT)

#### POST `/api/todo/create` ⚡ Rate Limited: 10/minute
Create a new TODO
```json
{
  "description": "Complete project documentation",
  "catagory": "Work"
}
```
**Response** (200 OK):
```json
{
  "todo": {
    "id": "uuid-here",
    "description": "Complete project documentation",
    "catagory": "Work",
    "status": "todo",
    "user_id": "uuid-here",
    "created_at": "2026-03-21T10:30:00"
  },
  "msg": "Todo Created.",
  "api_count": 1
}
```

#### GET `/api/todo/fetch` ⚡ Rate Limited: 15/minute
Fetch all TODOs for authenticated user
**Response** (200 OK):
```json
{
  "fetched_todos": [
    {
      "id": "uuid-1",
      "description": "Task 1",
      "catagory": "Work",
      "status": "todo",
      "user_id": "uuid-here",
      "created_at": "2026-03-21T10:30:00"
    }
  ],
  "msg": "Todo fetched.",
  "api_count": 2
}
```

#### GET `/api/todo/fetchById/{id}`
Fetch a specific TODO by UUID (owned by user)
**Response** (200 OK):
```json
{
  "todo": {
    "id": "uuid-1",
    "description": "Task 1",
    "catagory": "Work",
    "status": "todo",
    "user_id": "uuid-here",
    "created_at": "2026-03-21T10:30:00"
  },
  "msg": "Task found.",
  "api_count": 3
}
```

#### PUT `/api/todo/update`
Update TODO description by ID
**Query Parameters:**
- `id` (UUID) - TODO ID
- `new_description` (string) - New description text

**Response** (200 OK):
```json
{
  "todo": {
    "id": "uuid-1",
    "description": "Updated description",
    "catagory": "Work",
    "status": "todo",
    "user_id": "uuid-here",
    "created_at": "2026-03-21T10:30:00",
    "updated_at": "2026-03-21T11:00:00"
  },
  "msg": "Todo update sucessful.",
  "api_count": 4
}
```

#### PUT `/api/todo/updateStatus`
Update TODO status (todo → in-progress → done)
**Query Parameters:**
- `id` (UUID) - TODO ID
- `new_status` (string) - One of: `todo`, `in-progress`, `done`

**Response** (200 OK):
```json
{
  "todo": {
    "id": "uuid-1",
    "description": "Task 1",
    "catagory": "Work",
    "status": "in-progress",
    "user_id": "uuid-here"
  },
  "msg": "Task status updated.",
  "api_count": 5
}
```

#### DELETE `/api/todo/delete/{id}`
Delete TODO by UUID
**Response** (200 OK):
```json
{
  "msg": "Todo Deleted, Todo UUID : uuid-1",
  "error": null
}
```

#### GET `/api/todo/fetchBystatus`
Fetch all TODOs with a specific status
**Query Parameters:**
- `status` (string) - One of: `todo`, `in-progress`, `done`

**Response** (200 OK):
```json
{
  "fetched_todos": [
    {
      "id": "uuid-1",
      "description": "Task 1",
      "catagory": "Work",
      "status": "in-progress",
      "user_id": "uuid-here",
      "created_at": "2026-03-21T10:30:00"
    }
  ],
  "msg": "Task found.",
  "api_count": 6
}
```

## Rate Limits

- `POST /api/todo/create` - **10 requests/minute** per IP
- `GET /api/todo/fetch` - **15 requests/minute** per IP

## Setup & Installation

### Prerequisites
- Docker & Docker Compose
- Python 3.10+

### 1) Start PostgreSQL

```bash
docker compose up -d
```

Database credentials (from `docker-compose.yml`):
- **Host**: `localhost`
- **Port**: `5432`
- **Database**: `todo_db`
- **User**: `admin`
- **Password**: `admin`

### 2) Install Python Dependencies

Using `uv` (recommended):
```bash
uv sync
```

Or using `pip`:
```bash
pip install -r requirement.txt
```

### 3) Run the Application

```bash
uvicorn main:app --reload
```

The API will be available at: **http://127.0.0.1:8000**

## Interactive API Documentation

- **Swagger UI** (interactive): [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc** (read-only): [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

## Configuration

### Database Schema

- Schema name: `TODO_S` (configured in [app/config/db.py](app/config/db.py))
- Tables created automatically on startup:
  - `"TODO_S".user` - User accounts and credentials
  - `"TODO_S".todo` - TODO items linked to users

### Database URL

Default connection string (in [app/config/db.py](app/config/db.py)):
```
postgresql+asyncpg://admin:admin@localhost:5432/todo_db
```

### Environment & Startup

- Schema and tables are created automatically via SQLAlchemy on app startup
- No manual database initialization required
- Connection pooling is handled by SQLAlchemy's async engine

## Error Handling

API returns standard HTTP status codes:
- **201** - Created (successful signup)
- **200** - OK (successful request)
- **400** - Bad Request (invalid input/UUID)
- **401** - Unauthorized (invalid token, wrong password)
- **404** - Not Found (user/TODO not found)
- **429** - Too Many Requests (rate limit exceeded)

Error response format:
```json
{
  "msg": "Error message",
  "error": "Error details or null"
}
```

### GET `/api/todo/fetchById/{id}`
Fetch a specific TODO by ID

## Tech Stack

- **Framework**: FastAPI (Python web framework)
- **Validation**: Pydantic (data validation using Python type annotations)
- **Server**: Uvicorn (ASGI server)
- **Testing**: Pytest + HTTPx (API testing)
- **Package Manager**: UV (modern Python package installer)

## Project Structure

```
TODO/
├── main.py                 # Application entry point
├── pyproject.toml          # Project configuration
├── README.md               # This file
├── test_api.py             # API tests
├── APP/
│   ├── __init__.py         # Package initialization & router exports
│   └── TODO/
│       ├── __init__.py     # Module initialization
│       ├── model.py        # Pydantic models for data validation
│       ├── routes.py       # API endpoint definitions
│       └── database.py     # In-memory database (learning simplification)
```

## Setup & Installation

### Prerequisites
- Python 3.14+ (as specified in `pyproject.toml`)
- UV package manager (recommended) or pip

### Installation

1. **Clone the repository**:
```bash
git clone https://github.com/srikant-panda/TODO-api.git
cd TODO-api
```

2. **Install dependencies** (using UV):
```bash
uv sync
```
Or with pip:
```bash
pip install -r requirements.txt
```

3. **Run the server**:
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

4. **Interactive API Docs**:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Key Learning Concepts Implemented

### 1. **Routers & Modular Code**
```python
# routes.py - Organized endpoint definitions
todo_router = APIRouter(prefix="/todo", tags=["TODO"])

@todo_router.post('/create')
def create_todo(data: TodoRequest) -> TodoOut | Base:
    # Implementation
```

### 2. **Pydantic Models for Validation**
```python
# model.py - Type-safe data models
class Todo(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    description: str
    status: str = 'todo'
    created_at: date = Field(default_factory=date.today)
```

### 3. **Response Models & Status Codes**
```python
@todo_router.post('/create', response_model=TodoOut | Base)
def create_todo(data: TodoRequest):
    return Response(content=..., status_code=200)
```

## Next Steps to Enhance Learning

- [ ] Add persistent database (SQLAlchemy + PostgreSQL)
- [ ] Implement update and delete endpoints
- [ ] Add authentication (JWT tokens)
- [ ] Deploy to cloud (Heroku, Railway, Render)
- [ ] Add background tasks (Celery)
- [ ] Implement pagination and filtering
- [ ] Add API rate limiting
- [ ] Write comprehensive unit & integration tests
- [ ] Add logging and error handling
- [ ] Document with OpenAPI/Swagger

## Resources & Further Reading

- [FastAPI Official Docs](https://fastapi.tiangolo.com/)
- [Pydantic Docs](https://docs.pydantic.dev/)
- [REST API Best Practices](https://restfulapi.net/)
- [Python Type Hints](https://docs.python.org/3/library/typing.html)
- [ASGI Specification](https://asgi.readthedocs.io/)

## Contributing

This is a learning project! Feel free to:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the MIT License.

## Author

[Srikant Panda](https://github.com/srikant-panda)

---

**Happy Learning!** 

Feel free to explore the code, make modifications, and build on this foundation. The best way to learn web development is by doing!
