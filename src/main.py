import uvicorn
from fastapi import FastAPI


from src.api.users import router as router_users
from src.config import settings


app = FastAPI(debug=True)


app.include_router(router_users)


if __name__ == "__main__":
    uvicorn.run("main:app", reload=True)


