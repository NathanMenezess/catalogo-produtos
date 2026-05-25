from typing import List, Optional
from pydantic import BaseModel, Field, EmailStr
from datetime import datetime
from typing import Literal, Optional


RoleType = Literal["cliente", "vendedor", "admin", "compras"]

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
    stock_quantity: int = 0
    min_stock: int = 5

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
    phone: Optional[str] = None
    profile_image_url: Optional[str] = None

    cep: Optional[str] = None
    street: Optional[str] = None
    number: Optional[str] = None
    district: Optional[str] = None
    city: Optional[str] = None
    state_uf: Optional[str] = None

    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    cep: Optional[str] = None
    street: Optional[str] = None
    number: Optional[str] = None
    district: Optional[str] = None
    city: Optional[str] = None
    state_uf: Optional[str] = None

class ProfileStatsResponse(BaseModel):
    total_orders: int
    paid_orders: int
    pending_orders: int
    total_spent: float
    favorites_count: int

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

    customer_id: Optional[int] = None
    seller_id: Optional[int] = None
    origin: Optional[str] = None
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None
    seller_name: Optional[str] = None
    seller_email: Optional[str] = None
    
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
    customer_id: Optional[int] = None
    seller_id: Optional[int] = None


class SupplierCreate(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    cnpj: Optional[str] = None
    notes: Optional[str] = None


class SupplierResponse(SupplierCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class PurchaseOrderItemCreate(BaseModel):
    product_id: int
    quantity: int
    unit_cost: float


class PurchaseOrderCreate(BaseModel):
    supplier_id: int
    notes: Optional[str] = None
    items: List[PurchaseOrderItemCreate]


class PurchaseOrderItemResponse(BaseModel):
    id: int
    product_id: int
    product_title: str
    quantity: int
    unit_cost: float

    class Config:
        from_attributes = True


class PurchaseOrderResponse(BaseModel):
    id: int
    supplier_id: int
    supplier_name: Optional[str] = None
    buyer_id: int
    buyer_name: Optional[str] = None
    status: str
    total: float
    notes: Optional[str] = None
    created_at: datetime
    items: List[PurchaseOrderItemResponse]

    class Config:
        from_attributes = True