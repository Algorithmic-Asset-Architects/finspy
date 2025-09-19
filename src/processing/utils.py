import pandas as pd
import numpy as np
import pickle
from keras.models import load_model

# achaar kuppi
xgbm = pickle.load(open('processing/credit_card/model.pkl', 'rb'))
ann_model = load_model('processing/credit_card/ann_model.keras')

def preprocess_data(transaction):

    trans_df = pd.DataFrame([transaction])

    trans_df = trans_df.reindex(columns=xgbm.feature_names_in_, fill_value=0)
    return trans_df

def predict_credit_card_fraud(transaction):
    trans_data = preprocess_data(transaction)
    xgbm_pred = xgbm.predict_proba(trans_data)[:, 1].reshape(-1, 1)
    ann_input = np.hstack((trans_data, xgbm_pred))
    fraud_prob = float(ann_model.predict(ann_input)[0][0])
    is_fraud = fraud_prob > 0.5
    return {'fraud_probability': fraud_prob, 'is_fraud': is_fraud}
