from pydantic import BaseModel


class BasketSchema(BaseModel):
    id: int
    user_id: int
    item_id: int


class BasketAddSchema(BaseModel):
    user_id: int
    item_id: int
