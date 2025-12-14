from pydantic import BaseModel

class ProductBase(BaseModel):
    title: str
    subtitle: str
    price: float

class ProductCreate(ProductBase):
    pass

class ProductResponse(BaseModel):
    id: int
    title: str
    subtitle: str
    price: float
    image_url: str

    class Config:
        from_attributes = True