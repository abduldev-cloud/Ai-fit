from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.food_log import FoodLog
from app.schemas.food_log import FoodLogCreate, FoodLogOut, FoodImageEstimateRequest
from app.services.ai_nutrition import estimate_nutrition, estimate_nutrition_from_image

router = APIRouter()

@router.post("/estimate/image")
def estimate_food_image_ai(food_in: FoodImageEstimateRequest):
    """Estimate food nutrition using AI from an image."""
    nutrition = estimate_nutrition_from_image(food_in.image_base64)
    return nutrition

@router.post("/estimate")
def estimate_food_ai(food_in: FoodLogCreate):
    """Only estimate food nutrition using AI without saving to database."""
    nutrition = estimate_nutrition(food_in.text_input)
    return nutrition

@router.post("/log", response_model=FoodLogOut)
def log_food_ai(
    food_in: FoodLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Legacy endpoint: Log food directly from text using AI."""
    nutrition = estimate_nutrition(food_in.text_input)
    new_log = FoodLog(
        user_id=current_user.id,
        food_name=nutrition.get("food_name", food_in.text_input),
        raw_text=food_in.text_input,
        calories=nutrition.get("calories", 0),
        protein=nutrition.get("protein", 0.0),
        carbs=nutrition.get("carbs", 0.0),
        fat=nutrition.get("fat", 0.0)
    )
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    return new_log

from app.schemas.food_log import FoodLogBase
@router.post("/log/direct", response_model=FoodLogOut)
def log_food_direct(
    food_in: FoodLogBase,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Save explicit nutrition data directly to database without AI."""
    new_log = FoodLog(
        user_id=current_user.id,
        food_name=food_in.food_name,
        raw_text=food_in.food_name,
        calories=food_in.calories,
        protein=food_in.protein,
        carbs=food_in.carbs,
        fat=food_in.fat
    )
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    return new_log


@router.get("/history", response_model=List[FoodLogOut])
def get_food_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    limit: int = 100
):
    """Retrieve the recent food logs for the current user."""
    return db.query(FoodLog).filter(FoodLog.user_id == current_user.id).order_by(FoodLog.logged_at.desc()).limit(limit).all()
