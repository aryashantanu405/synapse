# packages/ml-training/scripts/predict_archetype.py

import pandas as pd
import joblib

# --- 1. Load the Saved Model, Scaler, and Columns ---
print("Loading saved model assets...")
kmeans_model = joblib.load('packages/ml-training/models/kmeans_model.joblib')
scaler = joblib.load('packages/ml-training/models/scaler.joblib')
model_columns = joblib.load('packages/ml-training/models/model_columns.joblib')
print("Assets loaded successfully!")


# --- 2. THE FIX: Create the Cluster-to-Name Mapping ---
# NOTE: This mapping is based on the analysis of your cluster centroids.
# You should update these names based on what you discovered in the last step.
# The cluster numbers might be different every time you retrain.
cluster_map = {
    0: "PointerStruggler (C++)",
    1: "JavaNewbie",
    2: "Pythonista",
    3: "LogicLooper",
    4: "PolyglotPro (Advanced)"
}
print(f"Cluster map defined: {cluster_map}")


# --- 3. Create New, Unseen User Data ---
# Let's test with the "LogicLooper" profile
new_user_data = {
    'cpp.InfiniteLoop': 21,
    'python.OffByOne': 19,
    'java.ArrayIndexOutOfBounds': 17,
    'cpp.PointerErrors': 5
}


# --- 4. Preprocess the New Data ---
print("\nPreprocessing new user data...")
new_user_df = pd.DataFrame([new_user_data])
new_user_df = new_user_df.reindex(columns=model_columns, fill_value=0)
scaled_new_user = scaler.transform(new_user_df)
print("New data preprocessed and scaled.")


# --- 5. Make a Prediction and Map it to a Name ---
print("\nMaking a prediction...")
prediction = kmeans_model.predict(scaled_new_user)
predicted_cluster_id = prediction[0]
predicted_archetype_name = cluster_map.get(predicted_cluster_id, "Unknown Cluster")

print("\n--- PREDICTION COMPLETE ---")
print(f"Numeric Cluster ID: {predicted_cluster_id}")
print(f"Predicted User Archetype: {predicted_archetype_name}")