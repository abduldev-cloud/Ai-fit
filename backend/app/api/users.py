from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.user import UserOut, UserUpdate
from app.services.calorie_engine import (
    calculate_daily_calories, 
    Gender, 
    ActivityLevel, 
    Goal as CalorieGoal
)

router = APIRouter()

@router.get("/me", response_model=UserOut)
def read_user_me(current_user: User = Depends(get_current_user)):
    """Retrieve current user profile."""
    return current_user

@router.put("/profile", response_model=UserOut)
def update_user_profile(
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update user profile and recalculate daily calorie needs."""
    
    # Update fields if provided
    update_data = user_in.model_dump(exclude_unset=True)
    
    # Map goal text to calories
    goal_map = {
        "lose": CalorieGoal.LOSE_WEIGHT,
        "maintain": CalorieGoal.MAINTAIN,
        "gain": CalorieGoal.GAIN_WEIGHT
    }

    # If we have all required fields, calculate calories
    # Use existing user data if new data isn't provided in the update
    weight = update_data.get("weight", current_user.weight)
    height = update_data.get("height", current_user.height)
    age = update_data.get("age", current_user.age)
    gender_str = update_data.get("gender", current_user.gender)
    activity_val = update_data.get("activity_level", current_user.activity_level)
    goal_str = update_data.get("goal", "maintain")

    # Perform calculation if data is available
    if all([weight, height, age, gender_str, activity_val]):
        try:
            # Map activity float to Enums
            activity_enum = next(a for a in ActivityLevel if a.value == activity_val)
            
            daily_goal = calculate_daily_calories(
                weight=weight,
                height=height,
                age=age,
                gender=Gender(gender_str),
                activity_level=activity_enum,
                goal=goal_map.get(goal_str, CalorieGoal.MAINTAIN)
            )
            current_user.daily_calorie_goal = daily_goal
        except Exception as e:
            # Calculation failed (maybe invalid enum), log it or handle
            pass

    # Update User model
    for field, value in update_data.items():
        if field != "goal": # Goal is just for calculation, not stored directly
            setattr(current_user, field, value)
    
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user
