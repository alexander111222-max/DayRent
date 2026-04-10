from pydantic import BaseModel, ConfigDict


class ItemPhotosSchema(BaseModel):
    id: int
    item_id: int
    position: int
    is_main: bool

    model_config = ConfigDict(from_attributes=True)

class ItemPhotosAddSchema(BaseModel):
    item_id: int
    position: int
    is_main: bool