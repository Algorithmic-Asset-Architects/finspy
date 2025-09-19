import pickle
import json
import pandas as pd
import numpy as np

# Step 1: Load the trained model from the pickle file
model_path = 'nandu.pkl'  # Path to the pickle file
with open(model_path, 'rb') as file:
    model = pickle.load(file)

# Step 2: Load the input JSON file
input_json_path = 'xgboost_sample_input.json'  # Path to the JSON input file
with open(input_json_path, 'r') as file:
    input_data = json.load(file)

# Step 3: Retrieve feature names from the model
# Assuming the model was trained with XGBoost and supports feature_names
feature_names = model.get_booster().feature_names  # Get the list of expected features

# Convert input JSON to DataFrame
input_df = pd.DataFrame([input_data])

# Step 4: Replicate one-hot encoding and align features
# One-hot encode categorical columns
one_hot_encoded_df = pd.get_dummies(input_df, columns=['merchant', 'category', 'gender'])

# Align the input columns with the model's expected features
aligned_input_df = pd.DataFrame(columns=feature_names)  # Create a DataFrame with only expected columns
aligned_input_df = pd.concat([aligned_input_df, one_hot_encoded_df], axis=0).fillna(0)

# Ensure the input DataFrame contains only the columns the model expects
aligned_input_df = aligned_input_df[feature_names]

# Convert the aligned DataFrame to a NumPy array
aligned_input = aligned_input_df.iloc[0].values.reshape(1, -1)

# Step 5: Predict using the model
predicted_class = model.predict(aligned_input)[0]  # Predicted class
predicted_proba = model.predict_proba(aligned_input)[0]  # Predicted probabilities

# Step 6: Print output
print("Predicted Class:", predicted_class)
print("Class Probabilities:", predicted_proba)
