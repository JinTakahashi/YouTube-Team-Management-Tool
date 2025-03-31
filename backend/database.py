from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# SQLiteのデータベースURL
DATABASE_URL = "sqlite:///./test.db"

# エンジン作成（SQLiteはシングルスレッドなのでcheck_same_thread=False）
engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)

# セッション作成用クラス
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Baseクラス（モデル定義時に継承する）
Base = declarative_base()
