from pydantic import BaseModel

class ProductBase(BaseModel):
    title: str
    subtitle: str
    price: float

class ProductCreate(ProductBase):
    pass

class ProductResponse(ProductBase):
    id: int
    image_url: str

    class Config:
        from_attributes = True
