# packages/services/ml-service/check_models.py

import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load the API key from our .env file
load_dotenv()
print("Attempting to configure API key...")
try:
    GOOGLE_API_KEY = os.getenv('GEMINI_API_KEY')
    if not GOOGLE_API_KEY:
        print("--> ERROR: GEMINI_API_KEY not found in .env file.")
    else:
        genai.configure(api_key=GOOGLE_API_KEY)
        print("API key configured.")

        print("\n--- Available Models ---")
        # This loop asks the API for its "menu"
        for m in genai.list_models():
            # We only care about models that can do what we want ('generateContent')
            if 'generateContent' in m.supported_generation_methods:
                print(f"Model Name: {m.name}")
        print("------------------------")

except Exception as e:
    print(f"An error occurred: {e}")