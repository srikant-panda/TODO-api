from ..config.db import Base,DEFAULT_SCHEMA_NAME
from datetime import datetime
from uuid import UUID,uuid4
from sqlalchemy import Column,String,DateTime,func,Uuid
from sqlalchemy.orm import Mapped,mapped_column

class TodoModel(Base):
    __tablename__ = 'todo'
    __table_args__ = {"schema" : DEFAULT_SCHEMA_NAME}


    id : Mapped[UUID] = mapped_column(
        Uuid,
        default= uuid4,
        primary_key=True,
        index=True,
    )

    description : Mapped[str] = mapped_column(
        String(200),
        nullable=False,
        index=True,
    )
    catagory : Mapped[str] = mapped_column(
        String,
        nullable=False,
        index=True
    )

    status : Mapped[str] = mapped_column(
        String,
        nullable=False,
        default= 'todo',
        index= True,
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