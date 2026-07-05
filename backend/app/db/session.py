from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# Use the DATABASE_URL from .env
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "mysql+mysqlconnector://root:password@localhost:3306/fitmind_db")

connect_args = {}
# Enable secure SSL/TLS connection for cloud databases (like TiDB Serverless)
if "localhost" not in SQLALCHEMY_DATABASE_URL and "127.0.0.1" not in SQLALCHEMY_DATABASE_URL:
    if "mysqlconnector" in SQLALCHEMY_DATABASE_URL:
        connect_args = {"ssl_disabled": False}
    else:
        # PyMySQL/mysqlclient expect {"ssl": {}} to enforce TLS connection
        connect_args = {"ssl": {}}

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency to get DB session in routes
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
