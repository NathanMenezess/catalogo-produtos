import os
from typing import Optional
import time

from fastapi import FastAPI, Depends, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.exc import IntegrityError

from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import Session, joinedload

from typing import List
from fastapi import Path

from sqlalchemy import delete

from . import models, schemas
from .database import SessionLocal, engine
from .services.cloudinary_service import upload_image, delete_image
from .auth import (
    hash_password,
    verify_password,
    create_access_token,
    require_roles,
    get_current_user,
)


app = FastAPI()


# =========================
# Startup: cria/verifica tabelas
# =========================
@app.on_event("startup")
def on_startup():
    last_error = None
    for i in range(10):
        try:
            models.Base.metadata.create_all(bind=engine)
            print(" Banco OK e tabelas criadas/verificadas")
            return
        except OperationalError as e:
            last_error = e
            print(f"⚠️ Banco indisponível (tentativa {i+1}/10). Aguardando 2s...")
            time.sleep(2)

    # Dev: sobe mesmo sem banco
    print("❌ Não consegui conectar no banco após 10 tentativas. Subindo mesmo assim.")
    print("Erro:", last_error)


# =========================
# CORS
# =========================
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://catalogo-front.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# DB dependency
# =========================
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# =========================
# Health
# =========================
@app.get("/")
def root():
    return {"status": "API rodando"}


# =========================
# Auth
# =========================
@app.post("/auth/register", response_model=schemas.UserResponse)
def register_user(payload: schemas.UserCreate, db: Session = Depends(get_db)):
    ADMIN_INVITE_CODE = "testeADMIN2026"

    role = "admin" if payload.invite_code == ADMIN_INVITE_CODE else "cliente"

    existing = db.query(models.User).filter(models.User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="E-mail já cadastrado")

    user = models.User(
        name=payload.name,
        email=payload.email,
        role=role,
        hashed_password=hash_password(payload.password),
    )

    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@app.post("/auth/login", response_model=schemas.TokenResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Credenciais inválidas")

    token = create_access_token(user_id=user.id, role=user.role)
    return {"access_token": token, "token_type": "bearer"}


@app.get("/auth/me", response_model=schemas.MeResponse)
def me(user: models.User = Depends(get_current_user)):
    return user

@app.patch("/profile", response_model=schemas.UserResponse)
def update_profile(
    payload: schemas.ProfileUpdate,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    if payload.name is not None:
        user.name = payload.name

    if payload.phone is not None:
        user.phone = payload.phone

    if payload.cep is not None:
        user.cep = payload.cep

    if payload.street is not None:
        user.street = payload.street

    if payload.number is not None:
        user.number = payload.number

    if payload.district is not None:
        user.district = payload.district

    if payload.city is not None:
        user.city = payload.city

    if payload.state is not None:
        user.state = payload.state

    db.commit()
    db.refresh(user)
    return user


@app.post("/profile/avatar", response_model=schemas.UserResponse)
def update_profile_avatar(
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    if user.profile_image_public_id:
        delete_image(user.profile_image_public_id)

    image_url, image_public_id = upload_image(image)

    user.profile_image_url = image_url
    user.profile_image_public_id = image_public_id

    db.commit()
    db.refresh(user)
    return user


@app.get("/profile/stats", response_model=schemas.ProfileStatsResponse)
def get_profile_stats(
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    orders_query = db.query(models.Order).filter(models.Order.user_id == user.id)

    orders = orders_query.all()

    total_orders = len(orders)
    paid_orders = len([o for o in orders if o.status == "paid"])
    pending_orders = len([o for o in orders if o.status == "pending"])
    total_spent = sum(float(o.total) for o in orders if o.status == "paid")

    favorites_count = (
        db.query(models.Favorite)
        .filter(models.Favorite.user_id == user.id)
        .count()
    )

    return {
        "total_orders": total_orders,
        "paid_orders": paid_orders,
        "pending_orders": pending_orders,
        "total_spent": total_spent,
        "favorites_count": favorites_count,
    }
# =========================
# Products
# =========================
@app.post("/products", response_model=schemas.ProductResponse)
def create_product(
    title: str = Form(...),
    subtitle: str = Form(...),
    price: float = Form(...),
    description: str = Form(...),
    category: str = Form(None),
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    _user: models.User = Depends(require_roles("admin", "vendedor")),
):
    image_url, image_public_id = upload_image(image)

    product = models.Product(
        title=title,
        subtitle=subtitle,
        price=price,
        image_url=image_url,
        image_public_id=image_public_id,
        description=description,
        category=category,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@app.get("/products", response_model=list[schemas.ProductResponse])
def list_products(db: Session = Depends(get_db)):
    return db.query(models.Product).all()


@app.delete("/products/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    _user: models.User = Depends(require_roles("admin", "vendedor")),
):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    # remove o produto de todos os carrinhos
    db.query(models.CartItem).filter(models.CartItem.product_id == product_id).delete()
    db.query(models.Favorite).filter(models.Favorite.product_id == product_id).delete()

    db.commit()

    # remove imagem
    if product.image_public_id:
        delete_image(product.image_public_id)

    db.delete(product)
    db.commit()

    return {"message": "Produto e imagem removidos"}


@app.put("/products/{product_id}", response_model=schemas.ProductResponse)
def update_product(
    product_id: int,
    title: str = Form(...),
    subtitle: str = Form(...),
    price: float = Form(...),
    description: str = Form(...),
    category: str = Form(None),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    _user: models.User = Depends(require_roles("admin", "vendedor")),
):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    product.title = title
    product.subtitle = subtitle
    product.price = price
    product.description = description
    product.category = category

    if image:
        if product.image_public_id:
            delete_image(product.image_public_id)

        image_url, image_public_id = upload_image(image)
        product.image_url = image_url
        product.image_public_id = image_public_id

    db.commit()
    db.refresh(product)
    return product

@app.get("/products/{product_id}", response_model=schemas.ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    return product


# =========================
# Favorites
# =========================

@app.get("/favorites", response_model=list[schemas.FavoriteResponse])
def list_favorites(
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    return (
        db.query(models.Favorite)
        .options(joinedload(models.Favorite.product))
        .filter(models.Favorite.user_id == user.id)
        .order_by(models.Favorite.created_at.desc())
        .all()
    )


@app.post("/favorites/{product_id}", response_model=schemas.FavoriteResponse)
def add_favorite(
    product_id: int,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    favorite = (
        db.query(models.Favorite)
        .filter(
            models.Favorite.user_id == user.id,
            models.Favorite.product_id == product_id,
        )
        .first()
    )

    if favorite:
        return favorite

    favorite = models.Favorite(
        user_id=user.id,
        product_id=product_id,
    )

    db.add(favorite)
    db.commit()
    db.refresh(favorite)

    return favorite


@app.delete("/favorites/{product_id}")
def remove_favorite(
    product_id: int,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    favorite = (
        db.query(models.Favorite)
        .filter(
            models.Favorite.user_id == user.id,
            models.Favorite.product_id == product_id,
        )
        .first()
    )

    if not favorite:
        raise HTTPException(status_code=404, detail="Favorito não encontrado")

    db.delete(favorite)
    db.commit()

    return {"message": "Produto removido dos favoritos"}


# =========================
# Cart helpers
# =========================
def require_cliente(user: models.User = Depends(get_current_user)):
    if user.role not in {"cliente", "admin", "vendedor"}:
        raise HTTPException(status_code=403, detail="Sem permissão para usar carrinho")
    return user


def get_or_create_cart(db: Session, user_id: int) -> models.Cart:
    cart = db.query(models.Cart).filter(models.Cart.user_id == user_id).first()
    if cart:
        return cart

    cart = models.Cart(user_id=user_id)
    db.add(cart)
    db.commit()
    db.refresh(cart)
    return cart


def cart_to_response(cart: models.Cart):
    total = sum(float(i.product.price) * i.quantity for i in cart.items)
    return {"id": cart.id, "user_id": cart.user_id, "items": cart.items, "total": total}


# =========================
# Cart endpoints
# =========================
@app.get("/cart", response_model=schemas.CartResponse)
def get_cart(
    db: Session = Depends(get_db),
    user: models.User = Depends(require_cliente),
):
    cart = get_or_create_cart(db, user.id)
    cart = (
        db.query(models.Cart)
        .options(joinedload(models.Cart.items).joinedload(models.CartItem.product))
        .filter(models.Cart.id == cart.id)
        .first()
    )
    return cart_to_response(cart)


@app.post("/cart/items", response_model=schemas.CartResponse)
def add_to_cart(
    payload: schemas.CartItemCreate,
    db: Session = Depends(get_db),
    user: models.User = Depends(require_cliente),
):
    product = db.query(models.Product).filter(models.Product.id == payload.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    cart = get_or_create_cart(db, user.id)

    item = (
        db.query(models.CartItem)
        .filter(models.CartItem.cart_id == cart.id, models.CartItem.product_id == payload.product_id)
        .first()
    )

    if item:
        item.quantity += payload.quantity
    else:
        item = models.CartItem(cart_id=cart.id, product_id=payload.product_id, quantity=payload.quantity)
        db.add(item)

    db.commit()

    cart = (
        db.query(models.Cart)
        .options(joinedload(models.Cart.items).joinedload(models.CartItem.product))
        .filter(models.Cart.id == cart.id)
        .first()
    )
    return cart_to_response(cart)


@app.patch("/cart/items/{item_id}", response_model=schemas.CartResponse)
def update_cart_item(
    item_id: int,
    payload: schemas.CartItemUpdate,
    db: Session = Depends(get_db),
    user: models.User = Depends(require_cliente),
):
    cart = get_or_create_cart(db, user.id)

    item = (
        db.query(models.CartItem)
        .filter(models.CartItem.id == item_id, models.CartItem.cart_id == cart.id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Item do carrinho não encontrado")

    if payload.quantity <= 0:
        db.delete(item)
    else:
        item.quantity = payload.quantity

    db.commit()

    cart = (
        db.query(models.Cart)
        .options(joinedload(models.Cart.items).joinedload(models.CartItem.product))
        .filter(models.Cart.id == cart.id)
        .first()
    )
    return cart_to_response(cart)


@app.put("/cart/items/product/{product_id}", response_model=schemas.CartResponse)
def update_cart_item_by_product(
    product_id: int,
    payload: schemas.CartItemUpdate,
    db: Session = Depends(get_db),
    user: models.User = Depends(require_cliente),
):
    cart = get_or_create_cart(db, user.id)

    item = (
        db.query(models.CartItem)
        .filter(models.CartItem.cart_id == cart.id, models.CartItem.product_id == product_id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Item do carrinho não encontrado")

    if payload.quantity <= 0:
        db.delete(item)
    else:
        item.quantity = payload.quantity

    db.commit()

    cart = (
        db.query(models.Cart)
        .options(joinedload(models.Cart.items).joinedload(models.CartItem.product))
        .filter(models.Cart.id == cart.id)
        .first()
    )
    return cart_to_response(cart)


@app.delete("/cart/items/{item_id}", response_model=schemas.CartResponse)
def delete_cart_item(
    item_id: int,
    db: Session = Depends(get_db),
    user: models.User = Depends(require_cliente),
):
    cart = get_or_create_cart(db, user.id)

    item = (
        db.query(models.CartItem)
        .filter(models.CartItem.id == item_id, models.CartItem.cart_id == cart.id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Item do carrinho não encontrado")

    db.delete(item)
    db.commit()

    cart = (
        db.query(models.Cart)
        .options(joinedload(models.Cart.items).joinedload(models.CartItem.product))
        .filter(models.Cart.id == cart.id)
        .first()
    )
    return cart_to_response(cart)


@app.delete("/cart/clear", response_model=schemas.CartResponse)
def clear_cart(
    db: Session = Depends(get_db),
    user: models.User = Depends(require_cliente),
):
    cart = get_or_create_cart(db, user.id)

    db.query(models.CartItem).filter(models.CartItem.cart_id == cart.id).delete()
    db.commit()

    cart = (
        db.query(models.Cart)
        .options(joinedload(models.Cart.items).joinedload(models.CartItem.product))
        .filter(models.Cart.id == cart.id)
        .first()
    )
    return cart_to_response(cart)



@app.get("/users/customers", response_model=List[schemas.UserListItem])
def list_customers(
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    return (
        db.query(models.User)
        .filter(models.User.role == "cliente")
        .order_by(models.User.name.asc())
        .all()
    )


@app.get("/users/sellers", response_model=List[schemas.UserListItem])
def list_sellers(
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    return (
        db.query(models.User)
        .filter(models.User.role == "vendedor")
        .order_by(models.User.name.asc())
        .all()
    )

# =========================
# Orders (Pedidos)
# =========================

@app.post("/orders")
def create_order(
    payload: schemas.CheckoutPayload,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    cart = db.query(models.Cart).filter(models.Cart.user_id == user.id).first()
    if not cart or not cart.items:
        raise HTTPException(status_code=400, detail="Carrinho vazio")

    #  calcula total com segurança
    total = 0.0
    for it in cart.items:
        if not it.product:
            raise HTTPException(status_code=400, detail="Item do carrinho inválido")
        total += float(it.quantity) * float(it.product.price)

    order = models.Order(
        user_id=user.id,

        customer_id=payload.customer_id,
        seller_id=payload.seller_id,

        total=total,
        status="pending",

        shipping_name=payload.shipping.name,
        shipping_phone=payload.shipping.phone,
        shipping_cep=payload.shipping.cep,
        shipping_street=payload.shipping.street,
        shipping_number=payload.shipping.number,
        shipping_district=payload.shipping.district,
        shipping_city=payload.shipping.city,
        shipping_state=payload.shipping.state,
        notes=payload.notes,
    )

    db.add(order)
    db.flush()  # garante order.id

    #  cria OrderItem preenchendo title e price (NOT NULL no seu model)
    for it in cart.items:
        p = it.product
        db.add(models.OrderItem(
            order_id=order.id,
            product_id=p.id,
            title=p.title,
            price=float(p.price),
            quantity=it.quantity,
            unit_price=float(p.price),
        ))

    #  limpa carrinho (pra virar "compra finalizada")
    db.query(models.CartItem).filter(models.CartItem.cart_id == cart.id).delete()

    db.commit()
    db.refresh(order)
    return order



@app.patch("/orders/{order_id}/pay", response_model=schemas.OrderResponse)
def simulate_payment(
    order_id: int,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    order = (
        db.query(models.Order)
        .options(joinedload(models.Order.items))
        .filter(models.Order.id == order_id)
        .first()
    )

    if not order:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")

    if user.role == "cliente" and order.user_id != user.id:
        raise HTTPException(status_code=403, detail="Sem permissão para pagar este pedido")

    if order.status == "paid":
        return order

    order.status = "paid"

    db.commit()
    db.refresh(order)

    return order


@app.get("/orders/me", response_model=list[schemas.OrderResponse])
def list_my_orders(
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    # cliente e vendedor veem só os próprios pedidos
    if user.role in {"cliente", "vendedor"}:
        q = db.query(models.Order).filter(models.Order.user_id == user.id)
    else:
        # admin vê todos os pedidos
        q = db.query(models.Order)

    orders = (
       q.options(
        joinedload(models.Order.items),
        joinedload(models.Order.customer),
        joinedload(models.Order.seller),
    )
    .order_by(models.Order.created_at.desc())
       .all()
    )
    return orders


@app.get("/orders/{order_id}", response_model=schemas.OrderResponse)
def get_order_by_id(
    order_id: int,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    order = (
    db.query(models.Order)
    .options(
        joinedload(models.Order.items),
        joinedload(models.Order.customer),
        joinedload(models.Order.seller),
    )
    .filter(models.Order.id == order_id)
    .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")

    # cliente só pode ver o próprio pedido
    if user.role == "cliente" and order.user_id != user.id:
        raise HTTPException(status_code=403, detail="Sem permissão para ver este pedido")

    # admin/vendedor pode ver qualquer
    return order





# LISTAR USUÁRIOS (somente admin)
@app.get("/admin/users", response_model=List[schemas.UserListItem])
def admin_list_users(
    db: Session = Depends(get_db),
    user: models.User = Depends(require_roles("admin")),
):
    users = db.query(models.User).order_by(models.User.id.desc()).all()
    return users


#  ATUALIZAR ROLE DE UM USUÁRIO (somente admin)
@app.patch("/admin/users/{user_id}", response_model=schemas.UserListItem)
def admin_update_user_role(
    payload: schemas.UserRoleUpdate,
    user_id: int = Path(..., ge=1),
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_roles("admin")),
):
    target = db.query(models.User).filter(models.User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    # (opcional, mas recomendado) impedir admin de tirar o próprio admin e se travar
    if target.id == admin.id and payload.role != "admin":
        raise HTTPException(status_code=400, detail="Você não pode remover seu próprio acesso de admin")

    target.role = payload.role
    db.commit()
    db.refresh(target)
    return target

@app.delete("/admin/users/{user_id}", status_code=204)
def admin_delete_user(
    user_id: int = Path(..., ge=1),
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_roles("admin")),
):
    target = db.query(models.User).filter(models.User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    if target.id == admin.id:
        raise HTTPException(status_code=400, detail="Você não pode excluir seu próprio usuário")

    #  1) Apagar dependências do usuário (carrinho, itens, pedidos...)
    # --- Carrinhos do usuário
    # Se existir CartItem:
    if hasattr(models, "CartItem"):
        user_cart_ids = [c.id for c in db.query(models.Cart.id).filter(models.Cart.user_id == user_id).all()]
        if user_cart_ids:
            db.execute(delete(models.CartItem).where(models.CartItem.cart_id.in_(user_cart_ids)))

    if hasattr(models, "Cart"):
        db.execute(delete(models.Cart).where(models.Cart.user_id == user_id))

    # --- Pedidos (se existir)
    if hasattr(models, "OrderItem") and hasattr(models, "Order"):
        user_order_ids = [o.id for o in db.query(models.Order.id).filter(models.Order.user_id == user_id).all()]
        if user_order_ids:
            db.execute(delete(models.OrderItem).where(models.OrderItem.order_id.in_(user_order_ids)))

    if hasattr(models, "Order"):
        db.execute(delete(models.Order).where(models.Order.user_id == user_id))

    #  2) Agora sim deletar o usuário
    db.execute(delete(models.User).where(models.User.id == user_id))
    db.commit()
    return