from fastapi import FastAPI, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import shutil
import os

from .database import SessionLocal, engine
from . import models, schemas

# Cria as tabelas no banco
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# =========================
# CORS (temporário liberado)
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
# Config upload
# =========================
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# =========================
# Dependência de banco
# =========================
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# =========================
# Rota raiz (Render health)
# =========================
@app.get("/")
def root():
    return {"status": "API rodando"}

# =========================
# Criar produto
# =========================
@app.post("/products", response_model=schemas.ProductResponse)
def create_product(
    title: str,
    subtitle: str,
    price: float,
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    image_path = f"{UPLOAD_DIR}/{image.filename}"

    with open(image_path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)

    product = models.Product(
        title=title,
        subtitle=subtitle,
        price=price,
        image_url=image_path,
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
