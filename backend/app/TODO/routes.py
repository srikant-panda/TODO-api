from fastapi import APIRouter,Response,Request,Depends,HTTPException
from fastapi.responses import JSONResponse
from .pydantic_schema import Todo,TodoFetch,TodoOut,Base,TodoRequest,validator
from uuid import UUID
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.security import OAuth2PasswordBearer
from app.services import JwtService
from sqlalchemy import Uuid, select,delete,exists
from app.models import TodoModel,UserModel
from app.config.db import get_db
# import asyncio

# limiter = Limiter(key_func=get_remote_address)
OAuthSchema = OAuth2PasswordBearer(tokenUrl='api/user/signin')

todo_router = APIRouter(
    prefix="/todo",
    tags=["TODO"]
)
async def get_correct_user(token : str = Depends(OAuthSchema),db: AsyncSession = Depends(get_db)) -> UUID:
    payload = JwtService().decode(token=token)
    if payload is None:
        raise HTTPException(
            detail='Invalid Token',
            status_code=401
        )
    id : UUID = payload.get('id') # type: ignore
    result = await db.execute(select(UserModel).where(UserModel.id == id))
    user = result.scalars().first()

    if not user:
        raise   HTTPException(
            detail='User Not Found',
            status_code=401
        )

    return id

async def check_id(id : str) -> UUID:
    try:
        UUID_id = UUID(id)
    except Exception as e :
        raise HTTPException(
            detail=Base(msg='Incorrcet UUID.',error=str(e)).model_dump(),
            status_code=400
            )
    return UUID_id


@todo_router.post('/create',response_model=TodoOut | Base)
# @limiter.limit("10/minute")  # pyright: ignore[reportUnknownMemberType, reportUntypedFunctionDecorator]
async def create_todo(request:Request,data : TodoRequest,db : AsyncSession = Depends(get_db),current_user : UUID = Depends(get_correct_user)) -> TodoOut:
    todo = TodoModel(**Todo(description=data.description,catagory=data.catagory,user_id=current_user).model_dump())
    db.add(todo)
    await db.commit()
    await db.refresh(todo)
    
    return TodoOut(
        todo= Todo.model_validate(todo),
        msg="Todo Created.",
    )


 


@todo_router.get('/fetch',response_model=TodoFetch)
# @limiter.limit("15/minute")
async def fetch_todo(request : Request , db: AsyncSession = Depends(get_db),current_user:str = Depends(get_correct_user)) -> TodoFetch :
    todo_db_result = await db.execute(select(TodoModel).where(TodoModel.user_id == current_user))   # it gives a listof tupels , each tuple belongs to a row
    todo_models = todo_db_result.scalars().all()   # scalers() makes the todo_db_result into orm models and .all() make it a respective TodoModel.
    print(todo_models)
    todos = [Todo.model_validate(todo_model) for todo_model in todo_models]
    if todos:
        return TodoFetch(fetched_todos = todos,msg="Todo fetched.")
    
    raise HTTPException(
        detail="No todo found.",
        status_code=404
    )

@todo_router.get('/fetchById/{id}',response_model=TodoOut)
async def get_todo_by_id(request:Request , id : UUID = Depends(check_id),db : AsyncSession = Depends(get_db),current_user : str = Depends(get_correct_user)) -> TodoOut :
        todo_db_result = await db.execute(select(TodoModel).where(TodoModel.id == id,TodoModel.user_id == current_user))   # it gives a listof tupels , each tuple belongs to a row
        todo_model = todo_db_result.scalar_one_or_none()
        if todo_model is None:
            raise HTTPException(
                detail='Task not found.Check your',
                status_code=404
                )
        return TodoOut(todo=Todo.model_validate(todo_model),msg="Task found.")
@todo_router.put('/update',response_model= TodoOut)
async def update_task_by_id(request : Request,new_description : str,id : UUID = Depends(check_id),db : AsyncSession = Depends(get_db),current_user : str = Depends(get_correct_user)) -> TodoOut:
    todo_db_result = await db.execute(select(TodoModel).where(TodoModel.id == id , TodoModel.user_id==current_user))
    todo_model = todo_db_result.scalar_one_or_none()
    if todo_model is None:
        raise HTTPException(detail='Todo not Found',status_code=404)
    
    todo_model.description = new_description
    await db.commit()
    await db.refresh(todo_model)
    return TodoOut(todo = Todo.model_validate(todo_model),msg="Todo update sucessful.")

@todo_router.delete('/delete/{id}',response_model= Base)
async def delete_todo_by_id(id : UUID = Depends(check_id),db:AsyncSession = Depends(get_db),current_user : str = Depends(get_correct_user)) -> Base | None:
    todo_db_result = await db.execute(delete(TodoModel).where(TodoModel.id == id,TodoModel.user_id == current_user).returning(TodoModel.id))
    await db.commit()
    todo_model_id = todo_db_result.scalar_one_or_none()
    if not todo_model_id:
        raise HTTPException(detail=Base(msg="Todo not found."),status_code=404)
    return Base(msg=f"Todo Deleted, Todo UUID : {todo_model_id}")
    

@todo_router.get('/fetchBystatus',response_model=TodoFetch)
async def get_todos_by_status(request : Request,status : str,db : AsyncSession = Depends(get_db),current_user : str = Depends(get_correct_user)) -> TodoFetch:
    todo_db_result = await db.execute(select(TodoModel).where(TodoModel.status == status,TodoModel.user_id == current_user))
    todo_models = todo_db_result.scalars().all()
    todos = [Todo.model_validate(todo_model) for todo_model in todo_models]
    if todos:
        return TodoFetch(fetched_todos=todos,msg="Task found.")
    raise HTTPException(detail=Base(msg="Task not found.").model_dump(),status_code=404)

@todo_router.put('/updateStatus',response_model=TodoOut|Base)
async def update_status_by_id(request : Request,new_status : str,id : UUID = Depends(check_id),db:AsyncSession = Depends(get_db),current_user = Depends(get_correct_user)) -> TodoOut | JSONResponse:
    f_status = validator(status=new_status)
    todo_db_result = await db.execute(select(TodoModel).where(TodoModel.id == id,TodoModel.user_id == current_user))
    todo_model = todo_db_result.scalar_one_or_none()
    if todo_model:
            todo_model.status = f_status.status
            await db.commit()
            return TodoOut(todo=Todo.model_validate(todo_model),msg="Task status updated.")
    if f_status is None:
        raise HTTPException(detail='Invalid input.Must be one of these: todo,in-progress and done',status_code=400)
    raise HTTPException(
        detail='Todo not found.',
        status_code=404
    )