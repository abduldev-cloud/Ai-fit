from pydantic import BaseModel, EmailStr
from typing import Optional

# Shared properties
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str

# Properties to return via API
class UserOut(UserBase):
    id: int
    age: Optional[int] = None
    weight: Optional[float] = None
    height: Optional[float] = None
    gender: Optional[str] = None
    activity_level: Optional[float] = None
    daily_calorie_goal: Optional[int] = None
    
    class Config:
        from_attributes = True

# Profile Update Schema
class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    age: Optional[int] = None
    weight: Optional[float] = None
    height: Optional[float] = None
    gender: Optional[str] = None # 'male' or 'female'
    activity_level: Optional[float] = None # 1.2 to 1.9
    goal: Optional[str] = None # 'lose', 'maintain', 'gain'

# Token Response Schema
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenPayload(BaseModel):
    sub: Optional[int] = None
