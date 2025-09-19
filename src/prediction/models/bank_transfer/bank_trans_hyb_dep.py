import pandas as pd
import numpy as np
import pickle
import json
import warnings
from keras.models import load_model
from json_sql_dump import insert_to_table, db_config

warnings.filterwarnings('ignore')

with open('label_encoders.pkl', 'rb') as f:
    lab_enc = pickle.load(f)
with open('trans_scal.pkl', 'rb') as f:
    scaler = pickle.load(f)
gb_model = pickle.load(open('fraud_detection_model.pkl', 'rb'))
ann_model = load_model('ann_bank_trans_fraud_detection.keras')
print("Models loaded successfully.")

def pre_proc(transaction):
    transaction_df = pd.DataFrame([transaction])
    transaction_df['balance_delta_orig'] = transaction_df['oldbalanceOrg'] - transaction_df['newbalanceOrig']
    transaction_df['balance_delta_dest'] = transaction_df['oldbalanceDest'] - transaction_df['newbalanceDest']
    transaction_df['transaction_ratio'] = transaction_df['amount'] / (transaction_df['oldbalanceOrg'] + 1)
    
    transaction_df.drop(['isFlaggedFraud', 'isFraud', 'nameOrig', 'nameDest' ], axis=1, inplace=True)
    
    for col, encoder in lab_enc.items():
        if col in transaction_df.columns:
            transaction_df[col] = transaction_df[col].apply(
                lambda x: np.where(encoder.classes_ == x)[0][0] if x in encoder.classes_ else -1
            )
    transaction_scaled = scaler.transform(transaction_df)
    return transaction_scaled

def predict_fraud(transaction_json):
    preprocessed_data = pre_proc(transaction_json)
    gb_prediction = gb_model.predict_proba(preprocessed_data)[:, 1].reshape(-1, 1)
    ann_input = np.hstack((gb_prediction, preprocessed_data))
    fraud_prob = float(ann_model.predict(ann_input)[0][0])
    is_fraud = fraud_prob > 0.5

    return {
        "fraud_probability": fraud_prob,
        "is_fraud": is_fraud
    }

with open('example_transaction.json', 'r') as f:
    example_transaction = json.load(f)

with open('example_transaction.json', 'r') as f:
    example_transactions = json.load(f)
    
n = 1
for transaction in example_transactions:
    result = predict_fraud(transaction)
    print(f"\nPrediction {n}: {result}")
    transaction.update(result)
    transaction.pop('isFraud')
    transaction.pop('isFlaggedFraud')
    n+=1
with open('example_transaction_result.json', 'w') as f:
    json.dump(example_transactions, f, indent=4)

insert_to_table('example_transaction_result.json', db_config)
