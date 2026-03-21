import email
from pydantic import BaseModel,Field,ConfigDict,field_validator
from uuid import UUID,uuid4
from datetime import datetime


class Base(BaseModel):
    msg : str
    error : str | None = None

class Todo(BaseModel):
    id : UUID = Field(default_factory=uuid4)
    description : str
    catagory : str 
    user_id : UUID
    status : str = 'todo'
    created_at : datetime = Field(default_factory=datetime.now)
    model_config = ConfigDict(extra='forbid',from_attributes=True)


class TodoOut(Base):
    todo : Todo
    api_count : int
class TodoFetch(Base):
    fetched_todos : list[Todo]
    email  : str | None = None
    api_count : int

class TodoRequest(BaseModel):
    description : str = Field(
        ...,
        title= "Name of the Task"
    )
    catagory : str = Field(
        ...,
        title= "Catagory of the task."
    )
class validator(BaseModel):
    status : str


    @field_validator('status',mode='after')
    @classmethod
    def status_validator(cls,payload : str) -> str | None:
        VALID_STATUS : list[str] = ['todo','in-progress','done']
        f_payload = payload.lower()

        if f_payload not in VALID_STATUS:
            return None
        return f_payload
