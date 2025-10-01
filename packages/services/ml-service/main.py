# main.py in your ml-service

from fastapi import FastAPI
import joblib
import pandas as pd
from pydantic import BaseModel
from typing import Dict, Any

# --- 1. Define the input data structure using Pydantic ---
# This tells FastAPI what the incoming JSON body should look like.
# It provides automatic validation and creates interactive API documentation.
# We expect a dictionary where keys are mistakePatternIds (strings)
# and values are their occurrenceCounts (integers).
class UserInputData(BaseModel):
    mistake_patterns: Dict[str, Any]

# --- 2. Load the trained model, scaler, and columns on startup ---
# This is a best practice. The assets are loaded once when the server starts,
# not on every single request, which makes predictions much faster.
print("Loading model assets...")
try:
    kmeans_model = joblib.load('../../ml-training/models/kmeans_model.joblib')
    scaler = joblib.load('../../ml-training/models/scaler.joblib')
    model_columns = joblib.load('../../ml-training/models/model_columns.joblib')
    print("Model assets loaded successfully!")
except FileNotFoundError as e:
    print(f"Error loading model assets: {e}")
    print("Please ensure you have run the training script first.")
    # In a real production app, you might want the server to exit if assets are missing.
    kmeans_model = scaler = model_columns = None

# This is the mapping from cluster ID to a human-readable name.
# You should update this based on your own analysis of the cluster centroids.
cluster_map = {
    0: "PointerStruggler (C++)",
    1: "JavaNewbie",
    2: "Pythonista",
    3: "LogicLooper",
    4: "PolyglotPro (Advanced)"
}

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Synapse ML Service is running!"}

# --- 3. Create the Prediction Endpoint ---
# This is the equivalent of `app.post('/predict/archetype', ...)` in Express.
@app.post("/predict/archetype")
async def predict_archetype(user_data: UserInputData):
    """
    Receives a user's mistake patterns, preprocesses them, and predicts
    their learning archetype using the pre-trained K-Means model.
    """
    # THE FIX: Explicitly check if any of the assets are None.
    # This avoids the "ambiguous truth value" error from Pandas.
    if kmeans_model is None or scaler is None or model_columns is None:
        return {"error": "Model assets not loaded. Cannot make a prediction."}

    # The incoming data is a dictionary, e.g., {'cpp.PointerErrors': 25, ...}
    new_user_data = user_data.mistake_patterns

    # Preprocess the new data to match the training format
    # 1. Create a DataFrame from the input dictionary.
    new_user_df = pd.DataFrame([new_user_data])
    # 2. Ensure it has the exact same columns in the same order as the training data,
    #    filling any missing mistake patterns with 0.
    new_user_df = new_user_df.reindex(columns=model_columns, fill_value=0)
    
    # Scale the new data using the SAME scaler from training.
    scaled_new_user = scaler.transform(new_user_df)

    # Make the prediction
    prediction = kmeans_model.predict(scaled_new_user)
    predicted_cluster_id = prediction[0]
    
    # Map the numeric ID to a meaningful name
    predicted_archetype_name = cluster_map.get(predicted_cluster_id, "Unknown Cluster")

    # Return the final prediction as a JSON response
    return {
        "cluster_id": int(predicted_cluster_id),
        "archetype": predicted_archetype_name
    }

