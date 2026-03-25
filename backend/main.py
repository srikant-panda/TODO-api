
from contextlib import asynccontextmanager
from fastapi import FastAPI,Request,HTTPException
from fastapi.middleware.cors import CORSMiddleware
# from fastapi.exceptions import RequestValidationError
from slowapi import Limiter
from slowapi.util import get_remote_address   # To get the ip address of user.
from slowapi.middleware import SlowAPIASGIMiddleware   # limiter middleware
from slowapi.errors import RateLimitExceeded    # Ratelimitexpection
from fastapi.responses import JSONResponse
from app import todo_router,user_router
from app.config.db import Base,engine,DEFAULT_SCHEMA_NAME
from sqlalchemy import text
import time
import json


@asynccontextmanager # will covert the code before yeild startup and after yeild cleanup
async def lifespan(app : FastAPI) :
    #Startup logic 
    print("Application startup")
    try:
        async with engine.begin() as conn:
            
            # Create scheme if not exists
            await conn.execute(text(f'CREATE SCHEMA IF NOT EXISTS "{DEFAULT_SCHEMA_NAME}"'))

            # Create all tables
            await conn.run_sync(Base.metadata.create_all)
    except Exception as e:
        print("Database error:",str(e))
    yield  # Run the app


    # Shutdown logic 

    await engine.dispose()
    print("Application stops.")

app = FastAPI(lifespan=lifespan)  # Call  the lifespan.

# Frontend (Vite dev server or static host) — allows cookies/Authorization when using full API URL
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5173",
        "http://localhost:5173",
        "http://[::1]:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

limiter = Limiter(key_func=get_remote_address)

app.state.limiter = limiter

app.add_middleware(SlowAPIASGIMiddleware)

def error_msg(message: str,code: str,status_code: int,extra: dict | None = None):
    response = {
        "msg" : message,
        "error" : code
    }
    if extra:
        response.update(extra)
    return response,status_code


@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request : Request,exec : RateLimitExceeded):
    return JSONResponse(
           status_code=429,
            content={
                "detail" : "Too many requests. limit execeed"
            },
    )
# app.state.count_db = {}

@app.middleware('http')   #capture all http request
async def request_detail(request : Request , call_next):
    path = request.url.path
    print(path)
    # if path in app.state.count_db:
    #     app.state.count_db[path]+=1
    # else:
    #     app.state.count_db[path] = 1
    
    response = await call_next(request)
    return response

routers = [todo_router,user_router]
for i in routers:
    app.include_router(router=i,prefix='/api')
    
@app.get("/api/health",response_model=dict[str,str],status_code=200,tags=["health"])
async def health():
    return {
        "status" : "ok",
        "system" : "up"
    }
