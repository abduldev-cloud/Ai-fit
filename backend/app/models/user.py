from sqlalchemy import Column, Integer, String, Float, Enum, DateTime, Boolean
from sqlalchemy.sql import func
from app.db.session import Base
import enum

class Gender(str, enum.Enum):
    MALE = "male"
    FEMALE = "female"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255))
    
    # Profile Data (Step 3 will use these)
    age = Column(Integer, nullable=True)
    weight = Column(Float, nullable=True) # in kg
    height = Column(Float, nullable=True) # in cm
    gender = Column(String(20), nullable=True)
    activity_level = Column(Float, nullable=True)
    daily_calorie_goal = Column(Integer, nullable=True)
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
