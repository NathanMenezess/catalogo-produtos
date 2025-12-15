import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# =========================
# Carrega o .env
# =========================
load_dotenv()

print("DATABASE_URL =", os.getenv("DATABASE_URL"))

# =========================
# URL do banco
# =========================
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL não definida no .env")

# Corrige caso venha postgres://
DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# =========================
# Engine
# =========================
engine = create_engine(DATABASE_URL)
print("Banco conectado com sucesso")

# =========================
# Sessão
# =========================
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# =========================
# Base
# =========================
Base = declarative_base()
