from pydantic import BaseModel,Field,ConfigDict,field_validator
from uuid import UUID,uuid4
from datetime import date
# from typing import Literal

class Base(BaseModel):
    msg : str
    error : str | None = None

class Todo(BaseModel):
    id : UUID = Field(default_factory=uuid4)
    description : str 
    status : str = 'todo'
    created_at : date = Field(default_factory=date.today)
    model_config = ConfigDict(extra='forbid')




class TodoOut(Base):
    todo : Todo
    api_count : int
class TodoFetch(Base):
    fetched_todos : list[Todo]
    api_count : int

class TodoRequest(BaseModel):
    description : str = Field(
        ...,
        title= "Name of the Task"
    )

class validator(BaseModel):
    status : str


    @field_validator('status',mode='after')
    @classmethod
    def __status_validator(cls,payload : str):
        VALID_STATUS : list[str] = ['todo','in-progress','done']
        f_payload = payload.lower()

        if f_payload not in VALID_STATUS:
            raise ValueError(f"Invlaid status value.")
        return f_payload
