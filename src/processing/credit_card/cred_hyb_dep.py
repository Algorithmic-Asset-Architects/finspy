import pandas as pd
import numpy as np
import pickle
import json
import warnings
from prep_dat import preprocess_data
from keras.models import load_model
from json_sql import insert_to_table, db_config

warnings.filterwarnings("ignore")

with open('encoders.pkl', 'rb') as f:
    encoders = pickle.load(f)
with open('scalar.pkl', 'rb') as f:
    scaler = pickle.load(f)
xgbm = pickle.load(open('cred_xgboost_model.pkl', 'rb'))
ccann = load_model('ann_cc_fraud_det.keras')
print('Models loaded successfully')

def pre_proc(transaction):
    trans_df = pd.DataFrame([transaction])
    trans_df = preprocess_data(trans_df)
    
    expected_columns = scaler.feature_names_in_
    trans_df = trans_df.reindex(columns=expected_columns, fill_value=0)
    
    # Apply label encoders to categorical columns
    for col, encoder in encoders.items():
        if col in trans_df.columns:
            trans_df[col] = trans_df[col].apply(
                lambda x: np.where(encoder.classes_ == x)[0][0] if x in encoder.classes_ else -1
            )
    
    # Handle missing and unknown values properly
    trans_df.replace(-1, np.nan, inplace=True)
    trans_df.fillna(trans_df.mean(), inplace=True)
    
    # Scale the input features
    trans_scal = scaler.transform(trans_df)
    return trans_scal

def predict_fraud(transaction_json):
    prep_data = pre_proc(transaction_json)
    xgbm_pred = xgbm.predict_proba(prep_data)[:, 1].reshape(-1, 1)
    ann_input = np.hstack((xgbm_pred, prep_data))
    
    fraud_prob = float(ccann.predict(ann_input)[0][0])
    is_fraud = fraud_prob > 0.5
    
    print(f"Fraud Probability: {fraud_prob}")
    print(f"Is Fraud: {is_fraud}")
    
    return {
        'fraud_probability': fraud_prob,
        'is_fraud': is_fraud
    }

with open('example1.json', 'r') as f:
    transactions = json.load(f)

n = 1
for transaction in transactions:
    prediction = predict_fraud(transaction)
    transaction.update(prediction)
    print(f"Transaction {n}: {prediction}")
    n += 1

with open('example1_out.json', 'w') as f:
    json.dump(transactions, f, indent=4)

insert_to_table('example1_out.json', db_config)