from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class FoodLogBase(BaseModel):
    food_name: str
    calories: int
    protein: float = 0.0
    carbs: float = 0.0
    fat: float = 0.0

class FoodLogCreate(BaseModel):
    text_input: str # "2 dosa and chutney"

class FoodImageEstimateRequest(BaseModel):
    image_base64: str

class FoodLogOut(FoodLogBase):
    id: int
    logged_at: datetime
    
    class Config:
        from_attributes = True
