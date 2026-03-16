from fastapi import APIRouter,Response
from .model import Todo,TodoFetch,TodoOut,Base,UUID,TodoRequest
import time
from .database import todo_db as db
import asyncio

todo_router = APIRouter(
    prefix="/todo",
    tags=["TODO"]
)


@todo_router.post('/create',response_model=TodoOut | Base)
def create_todo(data : TodoRequest) -> TodoOut | Base:
    if data:
        todo = Todo(description=data.description)
        db.append(todo)
        return Response(
            content=TodoOut(
            todo= todo,
            msg="Todo Created."
            ).model_dump_json(indent=4),
            status_code=200
        )
    return Response(
        content=Base(msg='no data is given.').model_dump_json(indent=4),
        status_code=400
    )
@todo_router.get('/fetch',response_model=TodoFetch | Base)
def fetch_todo() -> TodoFetch | Base:
    if len(db) !=0:
        return Response(
            content=TodoFetch(
                fetched_todos = db,
                msg="Todo fetched."
            ).model_dump_json(indent=4),
            status_code=200
        )
    return Response(
        content=Base(msg="No task found.").model_dump_json(indent=4),
        status_code=404
    )

@todo_router.get('/fetchById/{id}',response_model=TodoOut | Base)
def get_todo_by_id(id : str) -> TodoOut | Base :
    try:
        for i in db:
            if UUID(id) == i.id:
                return Response(
                    content=TodoOut(todo=i,msg="Task found.").model_dump_json(indent=4),
                    status_code=200,
                )
        return Response(
            content=Base(msg='Task not found.',error="Check your id.").model_dump_json(indent=4),
            status_code=404
            )
    except Exception as e:
        return  Response(
            content=Base(msg='Task not found.',error="Check your id.").model_dump_json(indent=4),
            status_code=400
            )
    
@todo_router.put('/update',response_model= TodoOut|Base)
def update_task_by_id(new_description : str,id : str):
    try:
        for i in db:
            if UUID(id) == i.id:
                i.description = new_description
                return Response(content=TodoOut(
                    todo= i,
                    msg="Todo update sucessfully."
                ).model_dump_json(indent=4),
                status_code=200
                )
        return Response(content=Base(msg='Todo not Found').model_dump_json(indent=4),status_code=404)
    except Exception as e:
        return Response(content=Base(msg="Incorrect UUID format.",error=str(e)).model_dump_json(indent=4),status_code=400)

@todo_router.delete('/delete',response_model= Base)
def delete_todo_by_id(id : str) -> Base:
    try:
        for i,j in enumerate(db):
            if UUID(id) == j.id:
                db.pop(i)
                return Response(content=Base(msg="Todo Deleted.").model_dump_json(indent=4),status_code=200)
        return Response(content=Base(msg="Todo not found.").model_dump_json(indent=4),status_code=404)
    except Exception as e:
        return Response(content=Base(msg="Incorrect UUID format.",error=str(e)).model_dump_json(indent=4),status_code=400)
@todo_router.get('/',response_model=TodoFetch|Base)
def get_todos_by_status(status : str) -> TodoOut | Base:
    todo : list[Todo] = [i for i in db if status.lower() == i.status]

    if len(todo) != 0:
        return Response(content=TodoFetch(fetched_todos=todo,msg="Task found.").model_dump_json(indent=4),status_code=200)
    return Response(content=Base(msg="Task not found.").model_dump_json(indent=4),status_code=404)
