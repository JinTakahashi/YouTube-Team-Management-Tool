from fastapi import FastAPI, HTTPException, Depends, Body
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from googleapiclient.discovery import build
from fastapi.middleware.cors import CORSMiddleware
from database import SessionLocal
from models import Video, Task, User
from datetime import datetime
import os
from models import Base
from database import engine
from auth import verify_password, create_access_token
from datetime import timedelta
from pydantic import BaseModel
from typing import Optional
from apscheduler.schedulers.background import BackgroundScheduler
from reminder import check_and_send_reminders


app = FastAPI()

Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # 明示的にフロントエンドのURLを指定
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# APIキーの設定（環境変数を使うのが望ましい）
API_KEY = "AIzaSyBqag1lZV3EF5hBMlC2tyyzPB7l3WnWJNY"
if not API_KEY:
    raise ValueError("YOUTUBE_API_KEYが設定されていません。")

# YouTube Data APIのサービスオブジェクト作成
youtube = build('youtube', 'v3', developerKey=API_KEY)

# DBセッション取得用の依存関係
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# -------------------------------
# POST: フロントからVideoIDと担当者を受け取る
# -------------------------------

class VideoCreateRequest(BaseModel):
    video_id: str
    assignee: str


@app.post("/video")
async def create_video(req: VideoCreateRequest, db: Session = Depends(get_db)):
    video_id = req.video_id
    assignee = req.assignee
    # 既に同じvideo_idが登録されていないか確認
    existing = db.query(Video).filter(Video.video_id == video_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="この動画は既に登録されています。")

    # YouTube APIから動画の詳細情報を取得
    video_response = youtube.videos().list(
        part='snippet,statistics',
        id=video_id
    ).execute()

    if not video_response['items']:
        raise HTTPException(status_code=404, detail="動画が見つかりません。")

    item = video_response['items'][0]
    snippet = item['snippet']
    statistics = item['statistics']

    # 動画情報の抽出
    title = snippet.get('title')
    published_at_str = snippet.get('publishedAt')
    try:
        published_at = datetime.strptime(published_at_str, "%Y-%m-%dT%H:%M:%SZ")
    except Exception:
        published_at = datetime.utcnow()

    view_count = int(statistics.get('viewCount', 0))
    channel_id = snippet.get('channelId')
    channel_name = snippet.get('channelTitle')

    # DBへの登録
    new_video = Video(
        video_id=video_id,
        title=title,
        published_at=published_at,
        views=view_count,
        channel_id=channel_id,
        channel_name=channel_name,
        assignee=assignee
    )
    db.add(new_video)
    db.commit()
    db.refresh(new_video)

    return {"message": "動画が登録されました", "video": {
        "video_id": new_video.video_id,
        "title": new_video.title,
        "published_at": new_video.published_at.isoformat(),
        "views": new_video.views,
        "channel_id": new_video.channel_id,
        "channel_name": new_video.channel_name,
        "assignee": new_video.assignee,
    }}

# -------------------------------
# GET: 登録済みの動画情報を一覧表示
# -------------------------------
@app.get("/videos")
async def get_videos(db: Session = Depends(get_db)):
    videos = db.query(Video).all()
    return {"videos": [
        {
            "video_id": video.video_id,
            "title": video.title,
            "published_at": video.published_at.isoformat(),
            "views": video.views,
            "channel_id": video.channel_id,
            "channel_name": video.channel_name,
            "assignee": video.assignee,
        }
        for video in videos
    ]}


@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.mail_address == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(status_code=401, detail="メールアドレスまたはパスワードが間違っています")

    access_token = create_access_token(
        data={"sub": user.mail_address},
        expires_delta=timedelta(minutes=30)
    )
    return {"access_token": access_token, "token_type": "bearer"}

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# パスワードハッシュ関数
def get_password_hash(password):
    return pwd_context.hash(password)

# サインアップ用のPydanticモデル
class SignupRequest(BaseModel):
    name: str
    mail_address: str
    password: str
    channel: str
    role: str

@app.post("/signup")
def signup(user: SignupRequest, db: Session = Depends(get_db)):
    # メールアドレス重複チェック
    existing_user = db.query(User).filter(User.mail_address == user.mail_address).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="既に登録されたメールアドレスです")

    hashed_password = get_password_hash(user.password)

    new_user = User(
        name=user.name,
        mail_address=user.mail_address,
        password=hashed_password,
        channel=user.channel,
        role=user.role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "ユーザー登録が完了しました", "user_id": new_user.id}



class TaskCreate(BaseModel):
    title: str
    assignee_id: int
    status: str
    reminder: Optional[str] = None
    note: Optional[str] = None
    channel: Optional[str] = None
    deadline: Optional[datetime] = None


@app.post("/tasks")
def create_task(task: TaskCreate, db: Session = Depends(get_db)):
    # 担当者が存在するか確認（ForeignKey制約チェック）
    user = db.query(User).filter(User.id == task.assignee_id).first()
    if not user:
        print(f"User with ID {task.assignee_id} not found")
        raise HTTPException(status_code=404, detail="指定された担当者が存在しません")

    new_task = Task(
        title=task.title,
        assignee_id=task.assignee_id,
        status=task.status,
        reminder=task.reminder,
        note=task.note,
        channel=task.channel,
        deadline=task.deadline
    )

    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    return {"message": "タスクを登録しました", "task_id": new_task.id}

@app.get("/tasks")
def read_tasks(db: Session = Depends(get_db)):
    tasks = db.query(Task).all()
    return {"tasks": [
        {
            "id": task.id,
            "title": task.title,
            "assignee_id": task.assignee_id,
            "status": task.status,
            "reminder": task.reminder,
            "note": task.note,
            "channel": task.channel,
            "deadline": task.deadline.isoformat() if task.deadline else None
        }
        for task in tasks
    ]}

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    assignee_id: Optional[int] = None
    status: Optional[str] = None
    reminder: Optional[str] = None
    note: Optional[str] = None
    channel: Optional[str] = None
    deadline: Optional[datetime] = None

@app.delete("/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="タスクが見つかりません")
    db.delete(task)
    db.commit()
    return {"message": "タスクを削除しました", "task_id": task_id}

@app.put("/tasks/{task_id}")
def update_task(task_id: int, task_update: TaskUpdate, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="タスクが見つかりません")

    if task_update.title is not None:
        task.title = task_update.title
    if task_update.assignee_id is not None:
        task.assignee_id = task_update.assignee_id
    if task_update.status is not None:
        task.status = task_update.status
    if task_update.reminder is not None:
        task.reminder = task_update.reminder
    if task_update.note is not None:
        task.note = task_update.note
    if task_update.channel is not None:
        task.channel = task_update.channel
    if task_update.deadline is not None:
        task.deadline = task_update.deadline

    db.commit()
    db.refresh(task)
    return {
        "message": "タスクを更新しました",
        "task": {
            "id": task.id,
            "title": task.title,
            "assignee_id": task.assignee_id,
            "status": task.status,
            "reminder": task.reminder,
            "note": task.note,
            "channel": task.channel,
            "deadline": task.deadline.isoformat() if task.deadline else None
        }
    }

# APScheduler起動
scheduler = BackgroundScheduler()
scheduler.add_job(check_and_send_reminders, 'interval', minutes=1)

@app.on_event("startup")
def start_scheduler():
    scheduler.start()

@app.get("/")
def read_root():
    return {"message": "FastAPI Reminder App is running"}
