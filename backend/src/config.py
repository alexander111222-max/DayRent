from pydantic_settings import BaseSettings, SettingsConfigDict
import os

class Settings(BaseSettings):

    DB_USER: str
    DB_PASS: str
    DB_HOST: str
    DB_PORT: str
    DB_NAME: str

    REDIS_HOST: str
    REDIS_PORT: str

    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int

    API_KEY: str

    SECRET_KEY_S3: str
    ACCESS_KEY_S3: str

    ES_PASSWORD: str
    ES_HOST: str
    ES_INDEX: str

    model_config = SettingsConfigDict(env_file=os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env-local"))

    @property
    def DB_URL(self):
        return f"postgresql+asyncpg://{self.DB_USER}:{self.DB_PASS}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    @property
    def REDIS_URL(self):
        return f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}"


settings = Settings()