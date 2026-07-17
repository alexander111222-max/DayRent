import pytest

from backend.src.config import settings
from backend.src.database import engine_null_pool, Base
from backend.src.models import *

@pytest.fixture(scope="session", autouse=True)
def check_mode_test():
    assert settings.MODE == "TEST"

@pytest.fixture(scope="session", autouse=True)
async def main_setup_database(check_mode_test):

    async with engine_null_pool.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)


