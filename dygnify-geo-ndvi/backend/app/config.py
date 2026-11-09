from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    CORS_ORIGINS: str = "http://localhost:5173"

    class Config:
        env_file = ".env"

settings = Settings()