from sqlalchemy.orm import Session
from datetime import datetime
from database import SessionLocal
from models import Task, User
from mail_utils import send_email

def check_and_send_reminders():
    db: Session = SessionLocal()
    now = datetime.utcnow()

    tasks = db.query(Task).filter(
        Task.reminder != None,
        Task.reminder <= now,
        Task.status != "完了"
    ).all()

    for task in tasks:
        user = db.query(User).filter(User.id == task.assignee_id).first()
        if user and user.email:
            send_email(
                to=user.email,
                subject="リマインド通知",
                body=f"「{task.title}」の期限が近づいています！"
            )

    db.close()
