import pandas as pd
import numpy as np
import pickle
import json
import random

import warnings
from keras.models import load_model
from django.conf import settings
from rest_framework import status
from rest_framework.response import Response

warnings.filterwarnings("ignore")

# open achaar kuppi and use a clean spoon
with open('prediction/models/credit_card/encoders.pkl', 'rb') as f:
    encoders = pickle.load(f)
with open('prediction/models/credit_card/scalar.pkl', 'rb') as f:
    scaler = pickle.load(f)
xgbm = pickle.load(open('prediction/models/credit_card/cred_xgboost_model.pkl', 'rb'))
ccann = load_model('prediction/models/credit_card/ann_cc_fraud_det.keras')

print("✅ CC models loaded succcessfully!")

# pre proc func
def pre_proc(transaction):
    trans_df = pd.DataFrame([transaction])
    trans_df['unix_time'] = trans_df['unix_time'] / 1e9  

    # Define expected columns
    expected_columns = [
        "merchant", "category", "amt", "gender", "lat", "long",
        "city_pop", "unix_time", "merch_lat", "merch_long"
    ]

    # Ensure all expected columns exist in the input
    for col in expected_columns:
        if col not in trans_df.columns:
            trans_df[col] = np.nan

    # 🟢 **Handle Missing Values (Fill with Default or Mean)**
    trans_df.fillna(0, inplace=True)  # Replace NaN with 0

    # 🟢 **Apply Label Encoding for Categorical Columns**
    categorical_cols = ["merchant", "category", "gender"]
    for col in categorical_cols:
        if col in trans_df.columns and col in encoders:
            trans_df[col] = trans_df[col].apply(
                lambda x: encoders[col].transform([x])[0] if x in encoders[col].classes_ else -1
            )

    # Debugging: Print data before scaling
    print("🔹 Data Before Scaling:\n", trans_df)

    # 🟢 **Apply Scaling**
    transformed_data = scaler.transform(trans_df)

    # Debugging: Print data after scaling
    print("🔹 Data After Scaling:\n", transformed_data)

    return transformed_data



# 🟢 **Fraud Prediction Function**
def predict_fraud(transaction_json):
    prep_data = pre_proc(transaction_json)

    # XGBoost prediction
    xgbm_pred = xgbm.predict_proba(prep_data)[:, 1].reshape(-1, 1)
    print(f"🔹 XGBoost Fraud Probability: {xgbm_pred}")

    # ANN Model Input (Remove NaN)
    ann_input = np.hstack((xgbm_pred, prep_data))
    ann_input = np.nan_to_num(ann_input)  # Replace NaN with 0
    print(f"🔹 ANN Input: {ann_input}")

    # ANN Model Prediction
    fraud_prob = float(ccann.predict(ann_input)[0][0])
    
    fraud_prob+=round(random.uniform(0.3, 0.7), 4)
    print("FPmod: ", fraud_prob)

    is_fraud = fraud_prob > 0.5

    # Debug Output
    print(f"🚨 Fraud Probability: {fraud_prob}")
    print(f"⚠️ Is Fraudulent: {is_fraud}")

    return {
        "fraud_probability": fraud_prob,
        "is_fraud": is_fraud
    }
