from fastapi import FastAPI,Request
from APP import todo_router
app = FastAPI()


routers = [todo_router]
for i in routers:
    app.include_router(router=i,prefix='/api')

