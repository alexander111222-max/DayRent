from pydantic import BaseModel, ConfigDict


class BasketSchema(BaseModel):
    id: int
    user_id: int
    item_id: int

    model_config = ConfigDict(from_attributes=True)

class BasketAddSchema(BaseModel):
    user_id: int
    item_id: int
