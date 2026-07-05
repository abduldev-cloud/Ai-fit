from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, JSON
from sqlalchemy.sql import func
from app.db.session import Base

class FoodLog(Base):
    __tablename__ = "food_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    food_name = Column(String(255), nullable=False)
    raw_text = Column(String(500)) # The original user input
    
    calories = Column(Integer, nullable=False)
    protein = Column(Float, default=0.0)
    carbs = Column(Float, default=0.0)
    fat = Column(Float, default=0.0)
    micronutrients = Column(JSON, nullable=True)
    
    logged_at = Column(DateTime(timezone=True), server_default=func.now())
