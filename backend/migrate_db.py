import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("No DATABASE_URL found in environment.")
    exit(1)

print(f"Connecting to database...")
engine = create_engine(DATABASE_URL)

try:
    with engine.connect() as conn:
        print("Checking if 'micronutrients' column exists in 'food_logs' table...")
        result = conn.execute(text("SHOW COLUMNS FROM food_logs LIKE 'micronutrients'")).fetchone()
        if not result:
            print("Column 'micronutrients' does not exist. Adding it...")
            conn.execute(text("ALTER TABLE food_logs ADD COLUMN micronutrients JSON NULL;"))
            # In sqlalchemy 2.0+ we need to commit on connection or use autocommit
            try:
                conn.commit()
            except Exception:
                pass
            print("Successfully added column 'micronutrients' to 'food_logs' table.")
        else:
            print("Column 'micronutrients' already exists. No migration needed.")
except Exception as e:
    print("Error during database migration:", e)
