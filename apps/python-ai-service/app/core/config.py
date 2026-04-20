from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    openai_api_key: str
    nextjs_api_url: str = "http://localhost:3000"
    nextjs_api_secret: str = ""
    chroma_persist_dir: str = "./data/chroma"
    log_level: str = "INFO"

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
