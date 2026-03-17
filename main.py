from fastapi import FastAPI,Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.middleware import SlowAPIASGIMiddleware
from slowapi.errors import RateLimitExceeded
from fastapi.responses import JSONResponse
from APP import todo_router
import time
import json
app = FastAPI()

limiter = Limiter(key_func=get_remote_address)

app.state.limiter = limiter


app.add_exception_handler(
        RateLimitExceeded,
        lambda request,exec : JSONResponse(
            status_code=429,
            content={
                "detail" : "Too many requests."
            },
        ),
)
app.add_middleware(SlowAPIASGIMiddleware)

@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request : Request,exec : RateLimitExceeded):
    return JSONResponse(
           status_code=429,
            content={
                "detail" : "Too many requests."
            },
    )

app.state.count_db = {}
# app.state.request_count = 0

@app.middleware('http')   #capture all http request
async def request_detail(request : Request , call_next):
    path = request['path']
    if path in app.state.count_db:
        app.state.count_db[path]+=1
    else:
        app.state.count_db[path] = 1
    payload = await request.body()    
    if payload:
        print(json.loads(payload))
    start = time.perf_counter()
    
    response = await call_next(request)
    end = time.perf_counter()
    print(f"{end-start}")
    return response

routers = [todo_router]
for i in routers:
    app.include_router(router=i,prefix='/api')

