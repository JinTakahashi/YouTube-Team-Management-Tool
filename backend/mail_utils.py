import smtplib
from email.mime.text import MIMEText

def send_email(to: str, subject: str, body: str):
    from_addr = "your_email@gmail.com"
    password = "your_app_password"

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = from_addr
    msg["To"] = to

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(from_addr, password)
        server.send_message(msg)
