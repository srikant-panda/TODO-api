from ..config.db import Base,DEFAULT_SCHEMA_NAME
from datetime import datetime
from uuid import UUID,uuid4
from pydantic import EmailStr
from sqlalchemy import Column,String,DateTime,func,Uuid,CHAR
from sqlalchemy.orm import Mapped,mapped_column



class UserModel(Base):
    __tablename__ = 'user'
    __table_args__ = {"schema" : DEFAULT_SCHEMA_NAME}


    id : Mapped[UUID] = mapped_column(
        Uuid,
        default= uuid4,
        primary_key=True,
        index=True,
    )

    name : Mapped[str] = mapped_column(
        String(200),
        nullable=False,
        index=True,
    )
    email : Mapped[EmailStr] = mapped_column(
        String(200),
        nullable=False,
        unique=True,
        index=True,
    )
    password : Mapped[str] = mapped_column(
        String(500),
        nullable=False,
    )
    role : Mapped[str] = mapped_column(
        String,
        nullable=False,
    )
    created_at : Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default= func.now()
    )

    updated_at : Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
        
    )

