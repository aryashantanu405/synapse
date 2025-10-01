# packages/ml-training/scripts/user_profile.py

import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import joblib # 1. Import the joblib library
import os

# --- (Steps 1-4 remain exactly the same) ---

print("Step 1: Loading dataset...")
df = pd.read_csv('packages/ml-training/data/synthetic_user_profiles.csv')

print("\nStep 2: Creating User-Feature Matrix...")
user_feature_matrix = df.pivot_table(
    index='userId', 
    columns='mistakePatternId', 
    values='occurrenceCount',
    fill_value=0
)

print("\nStep 3: Scaling features...")
scaler = StandardScaler()
scaled_features = scaler.fit_transform(user_feature_matrix)

print("\nStep 4: Training K-Means model...")
kmeans = KMeans(n_clusters=5, n_init="auto", random_state=42)
kmeans.fit(scaled_features)
user_feature_matrix['cluster'] = kmeans.labels_

print("\nStep 5: Analyzing the Results...")
# (Analysis code remains the same)
print("Number of users in each cluster:")
print(user_feature_matrix['cluster'].value_counts().sort_index())
print("\nAverage mistake counts per cluster (Cluster Centroids):")
cluster_centroids = user_feature_matrix.groupby('cluster').mean()
print(cluster_centroids)

# --- Step 6: Save the Model and Scaler ---
print("\nStep 6: Saving model and scaler to files...")

# Create a 'models' directory if it doesn't exist
models_dir = 'packages/ml-training/models'
os.makedirs(models_dir, exist_ok=True)

# Save the trained KMeans model
joblib.dump(kmeans, os.path.join(models_dir, 'kmeans_model.joblib'))

# Save the scaler object
joblib.dump(scaler, os.path.join(models_dir, 'scaler.joblib'))

# Save the column order of our feature matrix. This is CRITICAL for inference.
joblib.dump(user_feature_matrix.columns.drop('cluster'), os.path.join(models_dir, 'model_columns.joblib'))

print(f"Model, scaler, and columns saved successfully in '{models_dir}' directory!")