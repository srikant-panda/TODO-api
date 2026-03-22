import os
from datetime import datetime, timedelta, timezone
from jose import JWTError,jwt
from typing import Any

class JwtService:
    SECRET = os.getenv("SECRET_KEY", "Lucky Bhai Jaiho")
    ALGORITHM = os.getenv("ALGORITHM", "HS256")
    EXPIRY_TIME_IN_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

    def encode(self,id:str) -> str:
        data = {"id":id}

        expire = datetime.now(timezone.utc) + timedelta(minutes=JwtService.EXPIRY_TIME_IN_MINUTES)

        data.update({"exp" : expire})  # type: ignore

        return jwt.encode(
            data,
            JwtService.SECRET,
            JwtService.ALGORITHM
        )
    
    def decode(self,token : str) -> dict[str,Any] | None:
        try:
            return jwt.decode(token,JwtService.SECRET,algorithms=[JwtService.ALGORITHM])
        except JWTError as ex:
            print(f"Exeption at jwt : {str(ex)}")
            return None