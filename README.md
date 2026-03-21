# TODO API

FastAPI-based TODO backend with JWT authentication, PostgreSQL, SQLAlchemy async ORM, and per-user TODO access control.

## Current Status

- User signup and signin are implemented.
- JWT token generation and validation are implemented.
- TODO CRUD routes are protected and scoped to the authenticated user.
- Rate limiting is enabled on selected TODO routes.
- PostgreSQL is used as the persistence layer.

## Tech Stack

- `FastAPI`
- `SQLAlchemy` (async) + `asyncpg`
- `PostgreSQL`
- `Pydantic v2`
- `python-jose` (JWT)
- `passlib` + `argon2-cffi` (password hashing)
- `slowapi` (rate limiting)
- `uvicorn`

## Project Structure

```text
TODO/
├── main.py
├── pyproject.toml
├── docker-compose.yml
├── app/
│   ├── TODO/
│   │   ├── pydantic_schema.py
│   │   └── routes.py
│   ├── USER/
│   │   ├── userPydanticModel.py
│   │   └── user_route.py
│   ├── config/
│   │   └── db.py
│   ├── dependency/
│   │   └── depency.py
│   ├── models/
│   │   ├── todo_model.py
│   │   └── user_model.py
│   └── services/
│       ├── jwt_service.py
│       └── password_hash.py
└── README.md
```

## API Base URL

- Local: `http://127.0.0.1:8000`
- All routes in this app are mounted under: `/api`

## Authentication Flow

1. Create user with `POST /api/user/signup`.
2. Sign in with `POST /api/user/signin` to receive a JWT.
3. Send token in header for protected routes:
   - `Authorization: Bearer <your_token>`

## Endpoints

### User

- `POST /api/user/signup`
  - Create a new user.
- `POST /api/user/signin`
  - Authenticate user and return JWT token.

### TODO (Protected)

- `POST /api/todo/create`
  - Create a TODO for the authenticated user.
- `GET /api/todo/fetch`
  - Fetch all TODOs for the authenticated user.
- `GET /api/todo/fetchById/{id}`
  - Fetch a specific TODO by UUID (only if owned by authenticated user).
- `PUT /api/todo/update`
  - Update TODO description by UUID.
- `DELETE /api/todo/delete/{id}`
  - Delete TODO by UUID.
- `GET /api/todo/fetchBystatus`
  - Fetch TODOs by status (`todo`, `in-progress`, `done`).
- `PUT /api/todo/updateStatus`
  - Update TODO status by UUID.

## Rate Limits

- `POST /api/todo/create` -> `10/minute`
- `GET /api/todo/fetch` -> `15/minute`

## Run Locally

### 1) Start PostgreSQL (Docker)

```bash
docker compose up -d
```

Default database values from `docker-compose.yml`:

- Host: `localhost`
- Port: `5432`
- DB: `todo_db`
- User: `admin`
- Password: `admin`

### 2) Install dependencies

Using `uv`:

```bash
uv sync
```

Or using `pip`:

```bash
pip install -r requirement.txt
```

### 3) Start API server

```bash
uvicorn main:app --reload
```

## API Docs

- Swagger UI: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- ReDoc: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

## Notes

- Database schema name is configured as `TODO_S` in `app/config/db.py`.
- On app startup, schema and tables are created if they do not already exist.
- Current DB URL is hardcoded in `app/config/db.py`:
  - `postgresql+asyncpg://admin:admin@localhost:5432/todo_db`
# TODO API - Learning FastAPI Project

A modern REST API for TODO management built with **FastAPI**. This project demonstrates core web development concepts including API design, data validation, and asynchronous programming.

## Learning Objectives

This project teaches:
- **FastAPI Fundamentals**: Building efficient, production-ready APIs
- **Pydantic Validation**: Type hints and data validation
- **REST Principles**: CRUD operations and proper HTTP status codes
- **UUID Management**: Working with unique identifiers
- **Code Organization**: Modular project structure with routers and models

## Features

- Create TODO: Add new tasks with descriptions
- Fetch All TODOs: Retrieve all tasks in the database
- Fetch by ID: Get a specific task by UUID
- Task Status: Track task status (todo, in-progress, done)
- Timestamps: Automatic creation date tracking
- Type Safety: Full type hints with Pydantic models

## API Endpoints

### POST `/api/todo/create`
Create a new TODO task
```json
{
  "description": "Learn FastAPI"
}
```
**Response** (200 OK):
```json
{
  "todo": {
    "id": "uuid-here",
    "description": "Learn FastAPI",
    "status": "todo",
    "created_at": "2026-03-16"
  },
  "msg": "Todo Created."
}
```

### GET `/api/todo/fetch`
Fetch all TODO tasks
**Response** (200 OK):
```json
{
  "fetched_todos": [
    {
      "id": "uuid-1",
      "description": "Learn FastAPI",
      "status": "todo",
      "created_at": "2026-03-16"
    }
  ],
  "msg": "Todo fetched."
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

### 4. **In-Memory Database (Learning Pattern)**
```python
# database.py - Simple list-based storage for demonstration
todo_db = []
```
*Note: This is for learning purposes. Production apps should use PostgreSQL, MongoDB, etc.*

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
