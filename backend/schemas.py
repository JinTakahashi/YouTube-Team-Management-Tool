from pydantic import BaseModel

class UserLogin(BaseModel):
    mail_address: str
    password: str
