import pickle
import numpy as np
import pandas as pd
import warnings
import random

from keras.models import load_model
import xgboost as xgb


"""
curl -X POST http://127.0.0.1:8000/api/predict/device_monitoring/ \
-H "Content-Type: application/json" \
-d '{
    "income": 0.3,
    "name_email_similarity": 0.98650,
    "customer_age": 40,
    "days_since_request": 1,
    "credit_risk_score": 163,
    "payment_type": "AA",
    "velocity_6h": 13096.03,
    "velocity_24h": 7850.95,
    "velocity_4w": 6742.08,
    "bank_branch_count_8w": 5,
    "proposed_credit_limit": 1500.0,
    "source": "INTERNET",
    "device_os": "linux",
    "device_fraud_count": 0
}'

{"fraud_probability":0.00840063113719225,"is_fraud":false}

"""


warnings.filterwarnings("ignore")

# open acharkuppi and use a clean dry spoon
with open('prediction/models/device_monitoring/encoders.pkl', 'rb') as f:
    encoders = pickle.load(f)
with open('prediction/models/device_monitoring/scaler.pkl', 'rb') as f:
    scaler = pickle.load(f)

xgb_model = pickle.load(open('prediction/models/device_monitoring/fraud_detection_model.pkl', 'rb'))
ann_model = load_model('prediction/models/device_monitoring/ann_fraud_detection.keras')

print("✅ Device Monitoring Models Loaded Successfully.")

# Ensure correct feature order
EXPECTED_FEATURES = [
    "income", "name_email_similarity", "prev_address_months_count", "current_address_months_count",
    "customer_age", "days_since_request", "intended_balcon_amount", "payment_type", "zip_count_4w",
    "velocity_6h", "velocity_24h", "velocity_4w", "bank_branch_count_8w", "date_of_birth_distinct_emails_4w",
    "employment_status", "credit_risk_score", "email_is_free", "housing_status", "phone_home_valid",
    "phone_mobile_valid", "bank_months_count", "has_other_cards", "proposed_credit_limit", "foreign_request",
    "source", "session_length_in_minutes", "device_os", "keep_alive_session", "device_distinct_emails_8w",
    "device_fraud_count", "cr_month"
]

CATEGORICAL_FEATURES = ["payment_type", "employment_status", "housing_status", "source", "device_os"]

def preprocess_device_data(transaction):
    df = pd.DataFrame([transaction])

    # Apply label encoding for categorical features
    for col, encoder in encoders.items():
        if col in df.columns:
            df[col] = df[col].apply(lambda x: encoder.transform([x])[0] if x in encoder.classes_ else -1)

    # Ensure all expected features exist, fill missing values with 0
    df = df.reindex(columns=EXPECTED_FEATURES, fill_value=0)

    # Scale numerical features
    scaled_data = scaler.transform(df)
    return scaled_data

def predict_fraud(transaction_json):
    processed_data = preprocess_device_data(transaction_json)

    # Get XGBoost prediction
    xgb_prediction = xgb_model.predict_proba(processed_data)[:, 1].reshape(-1, 1)

    # Feed to ANN model
    ann_input = np.column_stack((xgb_prediction, processed_data))
    fraud_probability = float(ann_model.predict(ann_input)[0][0])
    is_fraud = fraud_probability > 0.5

    return {"fraud_probability": fraud_probability, "is_fraud": is_fraud}
