from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class Video(Base):
    __tablename__ = "videos"

    id = Column(Integer, primary_key=True, index=True)
    video_id = Column(String, unique=True, index=True)         # YouTubeの動画ID
    title = Column(String, index=True)                           # タイトル
    published_at = Column(DateTime, default=datetime.utcnow)     # 投稿日時
    views = Column(Integer, default=0)                           # 視聴回数
    channel_id = Column(String, index=True)                      # チャンネルID
    channel_name = Column(String, index=True)                    # チャンネル名
    assignee = Column(String, index=True)                        # 担当者（フロントから送信）


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)                  # タイトル
    assignee_id = Column(Integer, ForeignKey("users.id")) # 担当者（UserのIDを外部キーとして指定）
    status = Column(String, index=True)                 # ステータス（例："未着手", "進行中", "完了"）
    reminder = Column(DateTime, nullable=True)          # リマインダー日時
    note = Column(String, nullable=True)                # メモ
    channel = Column(String, index=True)                # チャネル名
    deadline = Column(DateTime, nullable=True)          # 納期

    assignee = relationship("User", back_populates="tasks")  # Userとのリレーション


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    mail_address = Column(String, index=True)  
    name = Column(String, index=True)                   # 名前
    password = Column(String)                             # パスワード（ハッシュ化されたもの）
    channel = Column(String, index=True)                # 担当チャンネル
    role = Column(String, index=True)                   # 役割（例："編集者", "マネージャー"など）

    tasks = relationship("Task", back_populates="assignee")  # Taskとのリレーション
