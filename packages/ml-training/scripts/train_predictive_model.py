# packages/ml-training/scripts/train_predictive_model.py

import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import joblib
import os

# --- 1. Load the New Dataset ---
# We load the dataset specifically designed for this classification task.
print("Step 1: Loading predictive hint dataset...")
df = pd.read_csv('packages/ml-training/data/predictive_hint_training_data.csv')
print("Dataset loaded successfully!")

# --- 2. Preprocessing & Feature Engineering (with One-Hot Encoding) ---
# GOAL: Convert all our text-based input features into numbers.
# WHY: A Random Forest model, like most ML models, cannot understand text like "PointerStruggler".
# We use One-Hot Encoding to turn each category into its own column with a 1 or 0.
print("\nStep 2: Preprocessing data with One-Hot Encoding...")

# Separate the features (X) from the target label (y)
features = df.drop('MISTAKE_MADE', axis=1)
labels = df['MISTAKE_MADE']

# Use Pandas' get_dummies() function. This is a very fast and easy way to perform One-Hot Encoding.
# It automatically finds all text columns and converts them.
features_encoded = pd.get_dummies(features, columns=['userArchetype', 'currentLanguage'])
print("Data has been numerically encoded.")
print("\nSample of the final features for the model:")
print(features_encoded.head())


# --- 3. Train the Random Forest Classifier ---
# GOAL: Train the model to learn the relationship between the input features and the mistake that was made.
print("\nStep 3: Training the Random Forest Classifier...")

# We use RandomForestClassifier because it's powerful and great for this type of problem.
# random_state=42 ensures we get the same results each time we train.
model = RandomForestClassifier(n_estimators=100, random_state=42)

# This is the line where the model "learns" from the data.
model.fit(features_encoded, labels)
print("Model training complete!")


# --- 4. Save the Model and the Encoder ---
# GOAL: Save our trained "brain" and the "recipe" for how we encoded the data.
print("\nStep 4: Saving the trained model and the feature encoder...")

models_dir = 'packages/ml-training/models'
os.makedirs(models_dir, exist_ok=True)

# Save the trained Random Forest model
joblib.dump(model, os.path.join(models_dir, 'random_forest_model.joblib'))

# CRITICAL STEP: We must also save the state of our encoder.
# This includes the exact columns that were created during get_dummies().
# We will need this to process live data in the exact same way during prediction.
joblib.dump(features_encoded.columns, os.path.join(models_dir, 'rf_model_columns.joblib'))

print(f"Random Forest model and columns saved successfully in '{models_dir}' directory!")