import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# =========================
# Pegar a URL do banco
# =========================
DATABASE_URL = os.environ.get("DATABASE_URL")

if DATABASE_URL:
    # =========================
    # Conexão com PostgreSQL (produção)
    # =========================
    engine = create_engine(DATABASE_URL)
    print("Conectando no PostgreSQL")
else:
    # =========================
    # Conexão com SQLite local (desenvolvimento)
    # =========================
    print("DATABASE_URL não encontrada, usando SQLite local")
    DATABASE_URL = "sqlite:///./database.db"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

# =========================
# Sessão do banco
# =========================
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# =========================
# Base para os models
# =========================
Base = declarative_base()
