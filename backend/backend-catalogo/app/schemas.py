from typing import List, Optional
from pydantic import BaseModel, Field, EmailStr
from datetime import datetime
from typing import Literal, Optional


RoleType = Literal["cliente", "vendedor", "admin"]

class ProductBase(BaseModel):
    title: str
    subtitle: str
    price: float
    description: str | None = None


class ProductCreate(ProductBase):
    pass


class ProductResponse(BaseModel):
    id: int
    title: str
    subtitle: str
    price: float
    image_url: str
    description: str | None = None
    category: Optional[str] = None

    class Config:
        from_attributes = True


class FavoriteResponse(BaseModel):
    id: int
    user_id: int
    product_id: int
    product: ProductResponse

    class Config:
        from_attributes = True

# =========================
# Users / Auth
# =========================

class UserBase(BaseModel):
    name: str
    email: str
    role: str = "cliente"  # admin | vendedor | cliente


class UserCreate(UserBase):
    password: str
    invite_code: str | None = None


class UserResponse(UserBase):
    id: int

    class Config:
        from_attributes = True


class UserListItem(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str  # ou RoleType

    class Config:
        from_attributes = True 

class UserRoleUpdate(BaseModel):
    role: RoleType

class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class MeResponse(UserResponse):
    pass




# =========================
# Cart
# =========================


class CartItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(default=1, ge=1)


class CartItemUpdate(BaseModel):
    quantity: int = Field(ge=1)


class CartItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    product: "ProductResponse"

    class Config:
        from_attributes = True


class CartResponse(BaseModel):
    id: int
    user_id: int
    items: List[CartItemResponse]
    total: float

    class Config:
        from_attributes = True




class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    title: str
    price: float
    quantity: int

    class Config:
        from_attributes = True


class OrderResponse(BaseModel):
    id: int
    user_id: int
    total: float
    status: str
    created_at: datetime

    shipping_name: str | None = None
    shipping_phone: str | None = None
    shipping_cep: str | None = None
    shipping_street: str | None = None
    shipping_number: str | None = None
    shipping_district: str | None = None
    shipping_city: str | None = None
    shipping_state: str | None = None
    notes: str | None = None

    items: List[OrderItemResponse]

    class Config:
        from_attributes = True

class ShippingInfo(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    cep: str
    street: str
    number: str
    district: str
    city: str
    state: str

class CheckoutPayload(BaseModel):
    shipping: ShippingInfo
    notes: Optional[str] = None