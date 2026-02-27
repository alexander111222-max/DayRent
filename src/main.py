import uvicorn
from fastapi import FastAPI


from src.api.users import router as router_users
from src.api.auth import router as router_auth



app = FastAPI(debug=True)


app.include_router(router_users)
app.include_router(router_auth)

if __name__ == "__main__":
    uvicorn.run("main:app", reload=True)


