import pickle
import numpy as np
import warnings
import json
from dimens import features as fts
from keras.models import load_model
import xgboost as xgb
import pandas as pd
from json_sql import insert_to_table, db_config

warnings.filterwarnings("ignore")

#Load the encoders and scaler
with open('encoders.pkl', 'rb') as en_file:
    encoders = pickle.load(en_file)
with open('scaler.pkl', 'rb') as sc_file:
    scaler = pickle.load(sc_file)

xgb_model = pickle.load(open('fraud_detection_model.pkl', 'rb'))
print("XGB Model loaded successfully.\n")

ann_model = load_model('ann_fraud_detection.keras')
print("ANN model loaded successfully.")

def preproc_trans(transaction):
    transaction_df = pd.DataFrame([transaction])
    
    #Encode categ_features
    for col, encoder in encoders.items():
        if col in transaction_df.columns:
            transaction_df[col] = transaction_df[col].apply(
                lambda x: np.where(encoder.classes_ == x)[0][0] if x in encoder.classes_ else -1
            )
    
    #Scale features
    transaction_scaled = scaler.transform(transaction_df[fts])
    return transaction_scaled

def predict_fraud(transaction_json):
    preprocessed_data = preproc_trans(transaction_json)
    xgb_prediction = xgb_model.predict_proba(preprocessed_data)[:, 1]
    ann_input = np.column_stack((xgb_prediction, preprocessed_data))
    fraud_probability = float(ann_model.predict(ann_input)[0][0])
    is_fraud = fraud_probability > 0.5
    
    return {
        "fraud_probability": fraud_probability,
        "is_fraud": is_fraud
    }
'''    
example_transaction = {
    "income": 0.3,
    "name_email_similarity": 0.986506310633034,
    "prev_address_months_count": -1,
    "current_address_months_count": 25,
    "customer_age": 40,
    "days_since_request": 0.0067353870811739,
    "intended_balcon_amount": 102.45371092469456,
    "payment_type": "AA",
    "zip_count_4w": 1059,
    "velocity_6h": 13096.035018400871,
    "velocity_24h": 7850.955007125409,
    "velocity_4w": 6742.080561007602,
    "bank_branch_count_8w": 5,
    "date_of_birth_distinct_emails_4w": 5,
    "employment_status": "CB",
    "credit_risk_score": 163,
    "email_is_free": 1,
    "housing_status": "BC",
    "phone_home_valid": 0,
    "phone_mobile_valid": 1,
    "bank_months_count": 9,
    "has_other_cards": 0,
    "proposed_credit_limit": 1500.0,
    "foreign_request": 0,
    "source": "INTERNET",
    "session_length_in_minutes": 16.224843433978073,
    "device_os": "linux",
    "keep_alive_session": 1,
    "device_distinct_emails_8w": 1,
    "device_fraud_count": 0,
    "cr_month": 0
}
'''
with open('example2.json', 'r') as f:
    data = json.load(f)
n=1
for transaction in data:
    result = predict_fraud(transaction)
    print(f"\nPrediction Result for transaction {n}: {result}\n")
    transaction.update(result)
    n+=1

with open('out_ex2.json', 'w') as f:
    json.dump(data,f, indent=4)

insert_to_table('out_ex2.json', db_config)
#result = predict_fraud(example_transaction)
#print("\nPrediction Result:")
#print(result)
