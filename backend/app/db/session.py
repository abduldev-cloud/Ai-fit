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
        # Search for standard Linux root certificate bundles (necessary for TiDB Serverless)
        import os
        ca_path = None
        for path in [
            "/etc/ssl/certs/ca-certificates.crt", # Debian/Ubuntu/Gentoo (Render)
            "/etc/pki/tls/certs/ca-bundle.crt",    # Fedora/CentOS/RHEL
            "/etc/ssl/ca-bundle.pem",              # OpenSUSE
            "/etc/ssl/cert.pem",                   # Alpine/macOS
        ]:
            if os.path.exists(path):
                ca_path = path
                break
        
        if ca_path:
            connect_args = {"ssl": {"ca": ca_path}}
        else:
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
