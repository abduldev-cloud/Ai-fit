from enum import Enum

class Gender(str, Enum):
    MALE = "male"
    FEMALE = "female"

class ActivityLevel(str, Enum):
    SEDENTARY = 1.2         # Little to no exercise
    LIGHTLY_ACTIVE = 1.375  # 1-3 days/week
    MODERATELY_ACTIVE = 1.55 # 3-5 days/week
    VERY_ACTIVE = 1.725      # 6-7 days/week
    EXTRA_ACTIVE = 1.9       # Intense work/sports twice a day

class Goal(str, Enum):
    LOSE_WEIGHT = -500       # Calorie deficit
    MAINTAIN = 0             # Maintenance
    GAIN_WEIGHT = 500        # Calorie surplus

def calculate_bmr(weight: float, height: float, age: int, gender: Gender) -> float:
    """Mifflin-St Jeor Equation for BMR."""
    if gender == Gender.MALE:
        return (10 * weight) + (6.25 * height) - (5 * age) + 5
    else:
        return (10 * weight) + (6.25 * height) - (5 * age) - 161

def calculate_daily_calories(weight: float, height: float, age: int, gender: Gender, activity_level: ActivityLevel, goal: Goal) -> int:
    """Calculate target daily calories based on BMR, activity, and weight goals."""
    bmr = calculate_bmr(weight, height, age, gender)
    tdee = bmr * activity_level.value
    daily_target = tdee + goal.value
    return int(daily_target)
