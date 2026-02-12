from decimal import Decimal

from pydantic import BaseModel, EmailStr, Field, ConfigDict


class UserSchema(BaseModel):
    id: int
    username: str
    surname: str
    age: int
    phone: str
    email: EmailStr
    city: str
    address: str
    lat: Decimal
    lon: Decimal

    model_config = ConfigDict(from_attributes=True)

class UserAddRequestSchema(BaseModel):
    username: str
    surname: str
    age: int
    phone: str
    email: EmailStr
    city: str
    address: str

class UserAddSchema(BaseModel):
    username: str
    surname: str
    age: int
    phone: str
    email: EmailStr
    city: str
    address: str
    lat: Decimal
    lon: Decimal

