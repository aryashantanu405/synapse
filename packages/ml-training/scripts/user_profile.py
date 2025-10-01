# packages/ml-training/scripts/user_profile.py

import pandas as pd

# THE FIX: This path is relative to the project's root directory,
# which is where you are running the command from.
df = pd.read_csv('packages/ml-training/data/synthetic_user_profiles.csv')

# Print the first 5 rows to confirm it works
print("Dataset loaded successfully!")
print(df.head())