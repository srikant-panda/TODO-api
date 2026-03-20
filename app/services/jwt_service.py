from datetime import datetime,timedelta
from jose import JWTError,jwt
from typing import Any

class JwtService:
    SECRET = "Lucky Bhsai Jaiho"
    ALGORITHM = 'HS256'
    EXPIRY_TIME_IN_MINUTES = 5

    def encode(self,email:str) -> str:
        data = {"email":email}

        expire = datetime.now() + timedelta(minutes=JwtService.EXPIRY_TIME_IN_MINUTES)

        data.update({"exp" : expire})  # type: ignore

        return jwt.encode(
            data,
            JwtService.SECRET,
            JwtService.ALGORITHM
        )
    
    def decode(self,token : str) -> dict[str,Any] | None:
        try:
            return jwt.decode(token,JwtService.SECRET,JwtService.ALGORITHM)
        except JWTError as ex:
            print(f"Exeption at jwt : {str(ex)}")
            return None