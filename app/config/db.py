# store the info about database structure, like tables,names,Schema and contrains
from sqlalchemy import MetaData

'''
-> create_async_engine = create postgresql database async engine
-> AsyncSession = this is a Database session
-> async_sessionmaker = new session for every db request.

'''
from sqlalchemy.ext.asyncio import AsyncSession,async_sessionmaker,create_async_engine

# Inherits the base class which used to create SQLAlchemy models.
from sqlalchemy.orm import DeclarativeBase,declarative_base

# Connection String
DATABASE_URL = "postgresql+asyncpg://admin:admin@localhost:5432/todo_db"

# Scheme Name
DEFAULT_SCHEMA_NAME = "TODO_S"

# Table automatically creates in this Scheme
metadata = MetaData(schema=DEFAULT_SCHEMA_NAME)


# Parent class of all ORM models
class Base(DeclarativeBase):
    metadata = metadata

# Handels the actual connection with db
engine = create_async_engine(
    DATABASE_URL,
    echo = True,  # Print the queries in the terminal 
    future = True, # it enforce the SQLAlchemy to use 2.x version
)

# Used to create a new session for each db request

AsyncSessionLocal = async_sessionmaker(
    bind= engine, # specifies which engine to use
    class_ = AsyncSession, # create asynchroneous request or response
    expire_on_commit=False # So that data will be accessible even after commit.
)



# FastAPI automatically open and close a session for each db request

async def get_db():
    async with AsyncSessionLocal() as session:   # Will close automatically
        yield session  # session of a DB request