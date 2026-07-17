
from pydantic import BaseModel
from typing_extensions import TypeVar, Generic

from backend.src.database import Base

SchemaType = TypeVar("SchemaType", bound=BaseModel)
ModelType = TypeVar("ModelType", bound=Base)

class DataMapper(Generic[ModelType, SchemaType]):
    model: type[ModelType]
    schema: type[SchemaType]

    @classmethod
    def map_to_domain_entity(cls, data):
        return cls.schema.model_validate(data)

    @classmethod
    def map_to_persistence_entity(cls, data):
        return cls.model(**data.model_dump())

