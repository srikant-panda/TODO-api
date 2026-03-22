# from uuid import UUID

# from fastapi import Depends, HTTPException
# from fastapi.security import OAuth2PasswordBearer
# from sqlalchemy import select
# from sqlalchemy.ext.asyncio import AsyncSession

# from app.config.db import get_db
# from app.models import UserModel
# from app.services import JwtService

# oauth_schema = OAuth2PasswordBearer(tokenUrl="api/user/signin")


# async def get_current_user_id(
#     token: str = Depends(oauth_schema),
#     db: AsyncSession = Depends(get_db),
# ) -> UUID:
#     payload = JwtService().decode(token=token)
#     if payload is None:
#         raise HTTPException(detail="Invalid token", status_code=401)

#     user_id = payload.get("id")
#     if user_id is None:
#         raise HTTPException(detail="Invalid token payload", status_code=401)

#     result = await db.execute(select(UserModel).where(UserModel.id == user_id))
#     user = result.scalars().first()
#     if user is None:
#         raise HTTPException(detail="User not found", status_code=401)

#     return user.id
