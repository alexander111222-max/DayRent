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
    lat: Decimal | None
    lon: Decimal | None

    model_config = ConfigDict(from_attributes=True)

class UserAddRequestSchema(BaseModel):
    username: str
    surname: str
    age: int
    phone: str
    email: EmailStr
    city: str
    address: str
    password: str

class UserAddSchema(BaseModel):
    username: str
    surname: str
    age: int
    phone: str
    email: EmailStr
    city: str
    address: str
    hash_password: str
    lat: Decimal | None = None
    lon: Decimal | None = None

class UserLoginSchema(BaseModel):
    email: EmailStr
    password: str


class UserSchemaWithHashPass(BaseModel):
    id: int
    username: str
    surname: str
    age: int
    phone: str
    email: EmailStr
    city: str
    address: str
    hash_password: str
    lat: Decimal
    lon: Decimal

    model_config = ConfigDict(from_attributes=True)

class CoordinateUser(BaseModel):
    lat: Decimal
    lon: Decimal