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
    age: int = Field(ge=18, le=120)
    phone: str
    email: EmailStr
    city: str
    address: str
    password: str
    password_confirm: str

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
    lat: Decimal | None
    lon: Decimal | None

    model_config = ConfigDict(from_attributes=True)

class CoordinateUser(BaseModel):
    lat: Decimal
    lon: Decimal


class UserUpdateSchema(BaseModel):
    id: int
    username: str
    surname: str
    age: int = Field(ge=18, le=120)
    phone: str
    email: EmailStr
    city: str
    address: str
    lat: Decimal | None
    lon: Decimal | None

    model_config = ConfigDict(from_attributes=True)

class UserPatchSchema(BaseModel):
    username: str | None = None
    surname: str | None = None
    age: int | None = Field(default=None, ge=18, le=120)
    phone: str | None = None
    email: EmailStr | None = None
    city: str | None = None
    address: str | None = None
    
