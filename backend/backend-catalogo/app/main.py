from fastapi import FastAPI, Depends, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import shutil
import os

from fastapi.staticfiles import StaticFiles
from .database import SessionLocal, engine
from . import models, schemas
from fastapi import HTTPException

from fastapi import FastAPI, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from .services.cloudinary_service import upload_image
from .services.cloudinary_service import delete_image



# =========================
# Cria as tabelas
# =========================
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


# =========================
# CORS
# =========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://catalogo-front.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# Upload
# =========================

# =========================
# DB
# =========================
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# =========================
# Health check (Render)
# =========================
@app.get("/")
def root():
    return {"status": "API rodando"}

# =========================
# Criar produto
# =========================
@app.post("/products", response_model=schemas.ProductResponse)
def create_product(
    title: str = Form(...),
    subtitle: str = Form(...),
    price: float = Form(...),
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    image_url, image_public_id = upload_image(image)

    product = models.Product(
        title=title,
        subtitle=subtitle,
        price=price,
        image_url=image_url,
        image_public_id=image_public_id,  # <-- salvo aqui
    )

    db.add(product)
    db.commit()
    db.refresh(product)

    return product

# =========================
# Listar produtos
# =========================
@app.get("/products", response_model=list[schemas.ProductResponse])
def list_products(db: Session = Depends(get_db)):
    return db.query(models.Product).all()


# =========================
# excluir produto
# =========================
@app.delete("/products/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    # 1️⃣ Deletar imagem do Cloudinary
    if product.image_public_id:
        delete_image(product.image_public_id)

    # 2️⃣ Deletar produto do banco
    db.delete(product)
    db.commit()

    return {"message": "Produto e imagem removidos"}

# =========================
# atualizar produto
# =========================
@app.put("/products/{product_id}", response_model=schemas.ProductResponse)
def update_product(
    product_id: int,
    title: str = Form(...),
    subtitle: str = Form(...),
    price: float = Form(...),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    # 1️⃣ Busca o produto
    product = db.query(models.Product).filter(
        models.Product.id == product_id
    ).first()

    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    # 2️⃣ Atualiza campos básicos
    product.title = title
    product.subtitle = subtitle
    product.price = price

    # 3️⃣ AQUI ENTRA O TRECHO QUE VOCÊ PERGUNTOU 👇
    if image:
        image_url = upload_image(image)
        product.image_url = image_url

    # 4️⃣ Salva no banco
    db.commit()
    db.refresh(product)

    return product
# =========================