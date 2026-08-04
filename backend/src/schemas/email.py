from pydantic import BaseModel, EmailStr


class ResendCodeEmailSchema(BaseModel):
    email: EmailStr

class VerifyEmailSchema(BaseModel):
    email: EmailStr
    code: int
