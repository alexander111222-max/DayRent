import os

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):


    RESEND_API_KEY: str

    model_config = SettingsConfigDict(env_file=os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env-local"))

settings = Settings()