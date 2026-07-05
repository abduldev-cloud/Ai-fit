import os
import json
import google.generativeai as genai
from typing import Dict, Any
from dotenv import load_dotenv

load_dotenv()

# Initialize Gemini client
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
MODEL = os.getenv("AI_MODEL", "gemini-1.5-flash")

def estimate_nutrition(text_input: str) -> Dict[str, Any]:
    """Use Gemini to estimate nutritional value from a text string."""
    
    prompt = f"""
    Estimate the total calories, protein, carbs, and fat for the following food: "{text_input}".
    
    Respond STRICTLY in JSON format with these exact keys. Do NOT include markdown blocks like ```json or anything else. Just the raw JSON object.
    {{
        "food_name": "Short descriptive name",
        "calories": integer,
        "protein": float (grams),
        "carbs": float (grams),
        "fat": float (grams)
    }}
    
    If the input is unclear, make your best professional estimate for a standard portion.
    """
    
    try:
        model = genai.GenerativeModel(MODEL)
        response = model.generate_content(prompt)
        text_response = response.text.strip()
        
        # Robust JSON extraction
        import re
        match = re.search(r'\{.*\}', text_response, re.DOTALL)
        if match:
            text_response = match.group(0)
            
        nutrition_data = json.loads(text_response)
        
        # Ensure correct types are returned even if AI hallucinates strings
        return {
            "food_name": str(nutrition_data.get("food_name", text_input)),
            "calories": int(nutrition_data.get("calories", 0)),
            "protein": float(nutrition_data.get("protein", 0)),
            "carbs": float(nutrition_data.get("carbs", 0)),
            "fat": float(nutrition_data.get("fat", 0))
        }
        
    except Exception as e:
        print(f"AI Estimation Error: {e}")
        # Fallback in case of API failure or key errors
        return {
            "food_name": text_input,
            "calories": 0,
            "protein": 0.0,
            "carbs": 0.0,
            "fat": 0.0,
            "error": str(e)
        }

def estimate_nutrition_from_image(image_b64: str) -> Dict[str, Any]:
    """Use Gemini Vision to estimate nutritional value from a base64 image."""
    prompt = """
    Identify the food or foods in this image and estimate the combined total calories, protein, carbs, and fat.
    
    Respond STRICTLY in JSON format with these exact keys. Do NOT include markdown blocks.
    {
        "food_name": "Short descriptive name",
        "calories": integer,
        "protein": float,
        "carbs": float,
        "fat": float
    }
    
    If the image is unclear or doesn't contain food, return 0 for everything and explain in the food_name.
    """
    
    image_part = {
        "mime_type": "image/jpeg",
        "data": image_b64
    }

    try:
        model = genai.GenerativeModel(MODEL)
        response = model.generate_content([prompt, image_part])
        text_response = response.text.strip()
        
        import re
        match = re.search(r'\{.*\}', text_response, re.DOTALL)
        if match:
            text_response = match.group(0)
            
        nutrition_data = json.loads(text_response)
        
        return {
            "food_name": str(nutrition_data.get("food_name", "Identified Food")),
            "calories": int(nutrition_data.get("calories", 0)),
            "protein": float(nutrition_data.get("protein", 0)),
            "carbs": float(nutrition_data.get("carbs", 0)),
            "fat": float(nutrition_data.get("fat", 0))
        }
        
    except Exception as e:
        print(f"AI Image Estimation Error: {e}")
        return {
            "food_name": "Unknown or Error",
            "calories": 0,
            "protein": 0.0,
            "carbs": 0.0,
            "fat": 0.0,
            "error": str(e)
        }
