# packages/services/ml-service/main.py

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pandas as pd
import joblib
import os
from typing import Dict, Optional
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv();

# --- 1. Load All Assets and Configure LLM ---
models = { "kmeans": None, "scaler": None, "kmeans_columns": None, "random_forest": None, "rf_columns": None }
MODELS_DIR = '../../ml-training/models'

# Load Scikit-learn models (as before)
try:
    # ... (loading logic remains the same)
    models["kmeans"] = joblib.load(os.path.join(MODELS_DIR, 'kmeans_model.joblib'))
    models["scaler"] = joblib.load(os.path.join(MODELS_DIR, 'scaler.joblib'))
    models["kmeans_columns"] = joblib.load(os.path.join(MODELS_DIR, 'model_columns.joblib'))
    models["random_forest"] = joblib.load(os.path.join(MODELS_DIR, 'random_forest_model.joblib'))
    models["rf_columns"] = joblib.load(os.path.join(MODELS_DIR, 'rf_model_columns.joblib'))
    print("All ML model assets loaded successfully.")
except Exception as e:
    print(f"ERROR loading model assets: {e}")


# Configure the Gemini LLM
try:
    GOOGLE_API_KEY = os.getenv('GEMINI_API_KEY')
    if not GOOGLE_API_KEY:
        print("WARNING: GEMINI_API_KEY not found in .env file. Hint generation will fail.")
    genai.configure(api_key=GOOGLE_API_KEY)
    llm = genai.GenerativeModel('gemini-2.0-flash-lite')
    print("Gemini LLM configured successfully.")
except Exception as e:
    llm = None
    print(f"ERROR configuring Gemini LLM: {e}")

app = FastAPI()

# --- 2. Define API Data Models ---

class ArchetypeInputData(BaseModel):
    mistake_patterns: Dict[str, int]

class HintInputData(BaseModel):
    userArchetype: str
    currentLanguage: str
    conceptMasteryScore: float
    timeInSession_minutes: int
    recentErrorCount: int

class GenerateHintInput(BaseModel):
    code_snippet: str
    language: str
    # This part is optional. The api-server will provide it.
    context: Optional[HintInputData] = None


# (Cluster map remains the same)
cluster_map = {0: "PointerStruggler (C++)", 1: "JavaNewbie", 2: "Pythonista", 3: "LogicLooper", 4: "PolyglotPro (Advanced)"}

def check_models_loaded():
    if any(value is None for value in models.values()):
        raise HTTPException(status_code=500, detail="One or more ML models are not loaded.")

# --- 3. API Endpoints ---

@app.get("/")
def read_root(): return {"message": "Synapse ML Service is running!"}

@app.post("/predict/archetype")
def predict_archetype(data: ArchetypeInputData):
    # ... (this function remains the same)
    check_models_loaded()
    new_user_df = pd.DataFrame([data.mistake_patterns])
    new_user_df = new_user_df.reindex(columns=models["kmeans_columns"], fill_value=0)
    scaled_new_user = models["scaler"].transform(new_user_df)
    prediction = models["kmeans"].predict(scaled_new_user)
    cluster_id = int(prediction[0])
    archetype_name = cluster_map.get(cluster_id, "Unknown Cluster")
    return {"cluster_id": cluster_id, "archetype": archetype_name}

# --- THE NEW LLM HINT GENERATION ENDPOINT ---
@app.post("/generate/hint")
def generate_hint(data: GenerateHintInput):
    if not llm:
        raise HTTPException(status_code=500, detail="LLM is not configured. Check API key.")
    
    predicted_mistake = "(No Mistake)"
    # --- The Two-Model Logic ---
    # First, use the Random Forest model if we have context
    if data.context:
        check_models_loaded()
        input_df = pd.DataFrame([data.context.model_dump()])
        features_encoded = pd.get_dummies(input_df)
        final_features = features_encoded.reindex(columns=models["rf_columns"], fill_value=0)
        prediction = models["random_forest"].predict(final_features)
        predicted_mistake = prediction[0]

    # --- Prompt Engineering ---
    # Now, build a smart prompt for the LLM
    system_prompt = f"""
You are an expert code assistant for the Synapse IDE. Your task is to analyze a code snippet and provide a single, concise, helpful hint for improvement.
- The user is programming in {data.language}.
- Your hint should be no more than two sentences.
- If you find no issues, you MUST respond with only the text "(No Hint)".
"""
    
    # This is the key part: we use our first model's prediction to guide the LLM
    if predicted_mistake and predicted_mistake != "(No Mistake)":
        system_prompt += f"\n- PREDICTION: This user is highly likely to be making a '{predicted_mistake}' error. Pay special attention to that."

    user_prompt = f"Here is the code snippet:\n\n```\n{data.code_snippet}\n```"
    
    # --- Call the LLM ---
    try:
        response = llm.generate_content([system_prompt, user_prompt])
        hint = response.text.strip()
        
        # Final safety check
        if not hint or len(hint) > 280:
             hint = "(No Hint)"

    except Exception as e:
        print(f"LLM generation failed: {e}")
        hint = "(No Hint)"

    return {"hint": hint, "predicted_mistake_category": predicted_mistake}