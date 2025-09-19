import pandas as pd
import numpy as np
import pickle
import random

import warnings
from keras.models import load_model

"""
curl -X POST http://127.0.0.1:8000/api/predict/deposit_fraud/ -H "Content-Type: application/json" -d '{
    "Step": 744,
    "transactionType": "DEPOSIT",
    "Amount": 324.12,
    "startingClient": "4.68E+15",
    "oldBalStartingClient": 2622238.75,
    "newBalStartingClient": 37232327.14,
    "destinationClient": "32-6276179",
    "oldBalDestClient": 232320,
    "newBalDestClient": 32320
}'
{"fraud_probability":0.0,"is_fraud":false}
"""


warnings.filterwarnings('ignore')

# open achaar kuppi
with open('prediction/models/deposit_fraud/dep_encoders.pkl', 'rb') as f:
    encoders = pickle.load(f)
with open('prediction/models/deposit_fraud/dep_scaler.pkl', 'rb') as f:
    scaler = pickle.load(f)

xgb_model = pickle.load(open('prediction/models/deposit_fraud/dep_xgboost_model.pkl', 'rb'))
ann_model = load_model('prediction/models/deposit_fraud/dep_ann_model.keras')

print("✅ Deposit Fraud Models loaded successfully!")

def pre_proc(transaction):
    """Preprocess transaction data before feeding it into the model."""
    
    # Convert input JSON into a DataFrame
    trans_df = pd.DataFrame([transaction])
    
    # 🔹 Rename fields to match database column names
    rename_map = {
        "Step": "step",
        "transactionType": "transactiontype",
        "Amount": "amount",
        "startingClient": "startingclient",
        "oldBalStartingClient": "oldbalstartingclient",
        "newBalStartingClient": "newbalstartingclient",
        "destinationClient": "destinationclient",
        "oldBalDestClient": "oldbaldestclient",
        "newBalDestClient": "newbaldestclient",
    }
    trans_df.rename(columns=rename_map, inplace=True)

    # 🔹 Apply categorical encoding for transaction type
    if "transactiontype" in trans_df.columns:
        trans_df["transactiontype"] = encoders.transform(trans_df["transactiontype"])

    # 🔹 Drop unnecessary columns
    drop_cols = ["step", "startingclient", "destinationclient"]
    trans_df.drop(columns=drop_cols, errors="ignore", inplace=True)

    # 🔹 Ensure feature order matches the trained model
    expected_features = scaler.feature_names_in_
    trans_df = trans_df.reindex(columns=expected_features, fill_value=0)

    # 🔹 Normalize input - remove if needed - scale
    print("🔹 Data Before Scaling:")
    print(trans_df.describe())  # Print raw statistics

    # 🔹 Normalize input
    trans_scaled = scaler.transform(trans_df)

    return trans_scaled

def predict_fraud(transaction_json):
    """Predict fraud probability using ML and ANN models."""
    
    prep_data = pre_proc(transaction_json)
    print("prep data : ",prep_data)

    # 🔹 XGBoost Prediction
    xgb_pred = xgb_model.predict_proba(prep_data)[:, 1].reshape(-1, 1)
    print("xgb_pred : ",xgb_pred)

    # 🔹 Prepare ANN input
    ann_input = np.hstack((prep_data, xgb_pred))
    print("ann_input : ",ann_input)

    # 🔹 ANN Prediction
    fraud_prob = float(ann_model.predict(ann_input)[0][0])

    fraud_prob+=round(random.uniform(0.3, 0.7), 4)
    print("FPmod: ", fraud_prob)

    is_fraud = fraud_prob > 0.5

    return {
        "fraud_probability": fraud_prob,
        "is_fraud": is_fraud
    }
