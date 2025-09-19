# prediction/utils/bank_transactions.py
import pandas as pd
import numpy as np
import pickle
import random
from keras.models import load_model
from processing.models import BankTransaction

# open the achhaar kuppi
with open('prediction/models/bank_transfer/label_encoders.pkl', 'rb') as f:
    lab_enc = pickle.load(f)
with open('prediction/models/bank_transfer/trans_scal.pkl', 'rb') as f:
    scaler = pickle.load(f)
gb_model = pickle.load(open('prediction/models/bank_transfer/fraud_detection_model.pkl', 'rb'))
ann_model = load_model('prediction/models/bank_transfer/ann_bank_trans_fraud_detection.keras')

print("Bank Transactions Models loaded successfully!")

def pre_proc(transaction):
    transaction_df = pd.DataFrame([transaction])

    # rename incoming request fields to match the model's expected feature names
    transaction_df.rename(columns={
        "newbalancedest": "newbalanceDest",
        "newbalanceorg": "newbalanceOrig",
        "oldbalancedest": "oldbalanceDest",
        "oldbalanceorg": "oldbalanceOrg",
        "t_type": "type"  # Match the feature name used in training
    }, inplace=True)

    # feature engineering by pravu
    transaction_df['balance_delta_orig'] = transaction_df['oldbalanceOrg'] - transaction_df['newbalanceOrig']
    transaction_df['balance_delta_dest'] = transaction_df['oldbalanceDest'] - transaction_df['newbalanceDest']
    transaction_df['transaction_ratio'] = transaction_df['amount'] / (transaction_df['oldbalanceOrg'] + 1)
    
    transaction_df.drop(['isFlaggedFraud', 'isFraud', 'nameorig', 'namedest'], axis=1, inplace=True)

    # Apply label encoding to categorical features
    for col, encoder in lab_enc.items():
        if col in transaction_df.columns:
            transaction_df[col] = transaction_df[col].apply(
                lambda x: np.where(encoder.classes_ == x)[0][0] if x in encoder.classes_ else -1
            )
    
    transaction_scaled = scaler.transform(transaction_df)
    return transaction_scaled

# Hybrid Model Prediction
def predict_fraud(transaction_json):
    preprocessed_data = pre_proc(transaction_json)
    print("Preprocessed Data: ", preprocessed_data)
    gb_prediction = gb_model.predict_proba(preprocessed_data)[:, 1].reshape(-1, 1)
    ann_input = np.hstack((gb_prediction, preprocessed_data))
    print("ANN Input: ", ann_input)
    fraud_prob = float(ann_model.predict(ann_input)[0][0])
    print("Fraud Probability: ", fraud_prob)
    fraud_prob+=round(random.uniform(0.3, 0.7), 4)
    print("FPmod: ", fraud_prob)

    is_fraud = fraud_prob > 0.5

    return {
        "fraud_probability": fraud_prob,
        "is_fraud": is_fraud
    }
