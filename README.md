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
