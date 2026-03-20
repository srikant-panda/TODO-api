from fastapi import APIRouter,Depends,HTTPException
from passlib.context import CryptContext
from ..models import UserModel
from .userPydanticModel import UserCreateOut,User,UserSignIn,Base,UserSignInResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..config import get_db
from ..services import HashService
user_router = APIRouter(prefix='/user',tags=['User'])

pwd_context = CryptContext(schemes=['argon2'],deprecated = 'auto')


@user_router.post('/signup',response_model= UserCreateOut | Base ,status_code=201)
async def signup(data : User,db: AsyncSession = Depends(get_db)) -> UserCreateOut | Base:
    try:
        data.password = HashService(pwd_context=pwd_context).hash_password(data.password)
        user_model = UserModel(**data.model_dump())
        db.add(user_model)
        await db.commit()
        await db.refresh(user_model)

        return UserCreateOut(user=User.model_validate(user_model),msg="User created.")
    except ValueError as v:
        return Base(msg="Invalid role",error=str(v))



@user_router.post('/signin')
async def signin(signin_payload : UserSignIn, db : AsyncSession = Depends(get_db)):
    user_db_result = await db.execute(select(UserModel).where(UserModel.email == signin_payload.email))
    user_model = user_db_result.scalar_one_or_none()

    if not user_model:
        raise HTTPException(detail=Base(msg='User not found').model_dump(),status_code=404)
    
    validate_result = HashService(pwd_context=pwd_context).verify_password(password=signin_payload.password,hash_password=user_model.password)

    if not validate_result:
        raise HTTPException(detail=Base(msg="Password not match.",error="Unauthorized request").model_dump(),status_code=401)
    
    return UserSignInResponse(token="Token",msg="User Signed in")