from pydantic import BaseModel,Field,ConfigDict,EmailStr,field_validator
from uuid import UUID,uuid4
from datetime import datetime

class Base(BaseModel):
    msg : str
    error : str | None = None

class User(BaseModel):
    id : UUID = Field(default_factory=uuid4)
    name : str
    password : str
    email: EmailStr
    role : str = Field(default='user')
    model_config = ConfigDict(extra='forbid',from_attributes=True)

    @field_validator('role',mode='after')
    @classmethod
    def role_validator(cls,role:str) -> str:
        VLAID_ROLE : list[str] = ['user','role']

        if role.lower() not in VLAID_ROLE:
            raise ValueError("Invalid role input.Role must be either \"user\" or \"admin\"")
        return role.lower()

class UserCreateOut(Base):
    user : User

class UserSignIn(BaseModel):
    email : str
    password : str

class UserSignInResponse(Base):
    token : str

class JwtOut(Base):
    jwt_token : str