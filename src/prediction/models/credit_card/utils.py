import pandas as pd
import numpy as np
import pickle
from datetime import datetime
import pytz
from keras.models import load_model
from processing.models import ExistingCreditCardTransaction

# Load pre-trained models and encoders only once
with open('processing/credit_card/encoders.pkl', 'rb') as f:
    encoders = pickle.load(f)
with open('processing/credit_card/scalar.pkl', 'rb') as f:
    scaler = pickle.load(f)
xgbm = pickle.load(open('processing/credit_card/cred_xgboost_model.pkl', 'rb'))
ccann = load_model('processing/credit_card/ann_cc_fraud_det.keras')

print('Models loaded successfully')

def validate_input_data(transaction):
    """Ensure required fields are present and handle missing values."""
    required_fields = ['amt', 'city_pop', 'lat', 'long', 'unix_time', 'merch_lat', 'merch_long']
    
    for field in required_fields:
        if field not in transaction or transaction[field] is None:
            print(f"Warning: Missing or None value for '{field}'. Setting to 0.")
            transaction[field] = 0
    
    return transaction

def preprocess_data(data):
    """Drop unnecessary columns and handle missing values."""
    columns_to_drop = ['index', 'trans_date_trans_time', 'cc_num', 'first', 'last', 
                       'street', 'city', 'state', 'zip', 'job', 'dob', 'trans_num']
    data = data.drop(columns=columns_to_drop, errors='ignore')
    data = data.fillna(0)  # Fill missing values with 0
    return data

def pre_proc(transaction):
    """Full preprocessing pipeline for transaction data."""
    trans_df = pd.DataFrame([transaction])
    trans_df = preprocess_data(trans_df)
    
    # Ensure columns match model input expectations
    expected_columns = scaler.feature_names_in_
    trans_df = trans_df.reindex(columns=expected_columns, fill_value=0)
    
    # Apply label encoding to categorical columns
    for col, encoder in encoders.items():
        if col in trans_df.columns:
            trans_df[col] = trans_df[col].apply(
                lambda x: np.where(encoder.classes_ == x)[0][0] if x in encoder.classes_ else -1
            )
    
    # Replace invalid values and scale the data
    trans_df.replace([np.inf, -np.inf], np.nan, inplace=True)
    trans_df.fillna(0, inplace=True)  # Replace NaN with 0
    trans_scal = scaler.transform(trans_df)
    return trans_scal


def predict_credit_card_fraud(transaction):
    """Predict fraud probability using both XGBoost and ANN models."""
    
    # 🟢 Validate input data
    transaction = validate_input_data(transaction)
    
    # 🟢 Preprocess the input data
    prep_data = pre_proc(transaction)
    
    # XGBoost model prediction
    xgbm_pred = xgbm.predict_proba(prep_data)[:, 1].reshape(-1, 1)
    
    # Prepare input for the ANN model
    ann_input = np.hstack((xgbm_pred, prep_data))
    
    # ANN model prediction
    fraud_prob = float(ccann.predict(ann_input)[0][0])
    
    # 🟢 Sanity check on fraud probability
    if not np.isfinite(fraud_prob) or fraud_prob < 0 or fraud_prob > 1:
        print(f"Anomalous fraud probability detected: {fraud_prob}. Resetting to 0.5.")
        fraud_prob = 0.5  # Set to a neutral probability if invalid
    
    is_fraud = fraud_prob > 0.5
    
    result = {
        'fraud_probability': fraud_prob if np.isfinite(fraud_prob) else 0.0,
        'is_fraud': is_fraud
    }
    
    # Update the transaction data with the prediction results
    transaction.update(result)
    
    # 🟢 Save the transaction and prediction to the existing database table
    save_to_existing_table(transaction)
    
    return result

def save_to_existing_table(transaction):
    """Save transaction data to the existing PostgreSQL table using Django ORM."""
    try:
        # 🟢 Ensure 'index' is mapped to 't_index' for the Django model
        if 'index' in transaction:
            transaction['t_index'] = transaction.pop('index')
        
        # 🟢 Convert 'trans_date_trans_time' to a timezone-aware format
        if 'trans_date_trans_time' in transaction:
            try:
                naive_dt = datetime.strptime(
                    transaction['trans_date_trans_time'], "%d-%m-%Y %H:%M"
                )
                # Make the datetime timezone-aware (set to UTC)
                transaction['trans_date_trans_time'] = pytz.UTC.localize(naive_dt)
            except ValueError as ve:
                print(f"Invalid date format: {transaction['trans_date_trans_time']}. Setting to None.")
                transaction['trans_date_trans_time'] = None
        
        # 🟢 Handle NaN and non-serializable values
        for key, value in transaction.items():
            if isinstance(value, float) and (np.isnan(value) or np.isinf(value)):
                transaction[key] = None
        
        # 🟢 Insert data into the existing table using Django ORM
        ExistingCreditCardTransaction.objects.create(**transaction)
        print("Data inserted into the existing database table successfully.")
    except Exception as e:
        print(f"Failed to insert data: {e}")
