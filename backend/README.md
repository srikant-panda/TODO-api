# TODO API

FastAPI-based TODO backend with **JWT authentication**, **PostgreSQL**, **SQLAlchemy async ORM**, and **per-user TODO access control**.

## Current Status

✅ Complete Features:
- User authentication (signup/signin) with JWT tokens
- Password hashing with argon2-cffi
- Per-user TODO management with full CRUD operations
- Rate limiting on create and fetch endpoints
- Automatic schema and table creation on startup
- Comprehensive error handling with proper HTTP status codes
- API response tracking/counting

## Tech Stack

- **FastAPI** - Modern async web framework
- **SQLAlchemy** (async) + **asyncpg** - Async ORM
- **PostgreSQL** - Relational database
- **Pydantic v2** - Data validation and serialization
- **python-jose** - JWT token handling
- **passlib + argon2-cffi** - Secure password hashing
- **slowapi** - Rate limiting
- **uvicorn** - ASGI server

## Project Structure

```text
.
├── main.py                          # FastAPI app with lifespan events
├── pyproject.toml                   # Project metadata and dependencies
├── docker-compose.yml               # PostgreSQL container config
├── requirement.txt                  # pip dependencies
├── pyrightconfig.json               # Pyright type checker config
├── README.md
└── app/
    ├── __init__.py
    ├── config/
    │   ├── __init__.py
    │   └── db.py                    # Database config and engine
    ├── dependency/
    │   ├── __init__.py
    │   └── depency.py               # Dependency injection utilities
    ├── models/
    │   ├── __init__.py
    │   ├── todo_model.py            # SQLAlchemy TODO model
    │   └── user_model.py            # SQLAlchemy User model
    ├── services/
    │   ├── __init__.py
    │   ├── jwt_service.py           # JWT encoding/decoding
    │   └── password_hash.py         # Password hashing service
    ├── TODO/
    │   ├── __init__.py
    │   ├── pydantic_schema.py       # Pydantic models for TODO
    │   └── routes.py                # TODO API endpoints
    └── USER/
        ├── __init__.py
        ├── user_route.py            # User API endpoints
        └── userPydanticModel.py     # Pydantic models for User
```

## Authentication Flow

1. **Signup**: `POST /api/user/signup` - Create a new user account
2. **Signin**: `POST /api/user/signin` - Authenticate and receive JWT token
3. **Protected Routes**: Send JWT in `Authorization: Bearer <token>` header

## API Endpoints

### User Endpoints

#### POST `/api/user/signup`
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
