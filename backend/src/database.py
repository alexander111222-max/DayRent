from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.ext.declarative import declarative_base

from backend.src.config import settings

Base = declarative_base()


engine = create_async_engine(settings.DB_URL)


async_session_maker = async_sessionmaker(engine, expire_on_commit=False)


def get_async_session_maker(url: str):
    # Эта функция создает новый движок КАЖДЫЙ РАЗ при вызове
    engine = create_async_engine(url, pool_pre_ping=True)
    return async_sessionmaker(bind=engine, expire_on_commit=False)