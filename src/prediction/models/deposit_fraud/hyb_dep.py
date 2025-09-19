import pandas as pd
import numpy as np
import pickle
import json
import warnings
from keras.models import load_model
from json_sql import insert_to_table, db_config

warnings.filterwarnings('ignore')

with open('dep_encoders.pkl', 'rb') as f:
    encoders = pickle.load(f)
with open('dep_scaler.pkl', 'rb') as f:
    scaler = pickle.load(f)
xgb_model = pickle.load(open('dep_xgboost_model.pkl', 'rb'))
ann_model = load_model('dep_ann_model.keras')

def pre_proc(transaction):
    trans_df = pd.DataFrame([transaction])
    
    trans_df['transactionType'] = encoders.transform(trans_df['transactionType'])
    trans_df = trans_df.drop(columns=['Step', 'startingClient', 'destinationClient'])
    trans_scal = scaler.transform(trans_df)
    return trans_scal

def predict_fraud(transaction_json):
    prep_data = pre_proc(transaction_json)
    xgbpred = xgb_model.predict_proba(prep_data)[:,1].reshape(-1,1)
    ann_inp = np.hstack((prep_data, xgbpred))
    fraud_prob = float(ann_model.predict(ann_inp)[0][0])
    is_fraud = fraud_prob > 0.5
    
    return {
        'fraud_probability': fraud_prob,
        'is_fraud': is_fraud
    }
with open('exampl1.json', 'r') as f:
    transactions = json.load(f)
'''
result = predict_fraud(transaction)
print(result)
transaction.update(result)
print(transaction)
'''
n=1
for transaction in transactions:
    result = predict_fraud(transaction)
    print(f"Prediction {n}: {result}")
    transaction.update(result)
    n += 1

with open('exampl1_out.json', 'w') as f:
    json.dump(transactions, f, indent=4)
    
insert_to_table('exampl1_out.json', db_config)