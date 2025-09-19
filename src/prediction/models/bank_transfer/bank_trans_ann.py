import pandas as pd
import numpy as np
import pickle
from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.utils import resample
from keras.models import Model
from keras.layers import Input, Dense, Dropout

#Build ANN Model
def build_ann(input_shape):
    inp_layer = Input(shape=input_shape)
    x = Dense(64, activation='relu')(inp_layer)
    x = Dropout(0.3)(x)
    x = Dense(32, activation='relu')(x)
    x = Dropout(0.3)(x)
    out_layer = Dense(1, activation='sigmoid')(x)
    model = Model(inputs=inp_layer, outputs=out_layer)
    model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
    return model

#Load Dataset
data = pd.read_csv('data2.csv')

#Cleaning Data
data.fillna(0, inplace=True)

#Feature Engineering
data['balance_delta_orig'] = data['oldbalanceOrg'] - data['newbalanceOrig']
data['balance_delta_dest'] = data['oldbalanceDest'] - data['newbalanceDest']
data['transaction_ratio'] = data['amount'] / (data['oldbalanceOrg'] + 1)

#Encoding
with open('label_encoders.pkl', 'rb') as f:
    label_encoders = pickle.load(f)
for col, encoder in label_encoders.items():
    if col in data.columns:
        data[col] = encoder.transform(data[col])

#Define Features and Target
target = 'isFraud'
features = [col for col in data.columns if col not in ['isFraud', 'isFlaggedFraud', 'nameOrig', 'nameDest']]
X = data[features]
y = data[target]

#Imbalance Correction (Resampling)
fraud = data[data[target] == 1]
non_fraud = data[data[target] == 0]

fraud_upsampled = resample(fraud, replace=True, n_samples=len(non_fraud), random_state=42)
balanced_data = pd.concat([fraud_upsampled, non_fraud])

X = balanced_data[features]
y = balanced_data[target]

#Scaling
with open('trans_scal.pkl', 'rb') as f:
    scaler = pickle.load(f)

X_scaled = pd.DataFrame(scaler.transform(X), columns=X.columns)

#Train-Test Split
X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.3, random_state=42)

#Load GB Model
with open('fraud_detection_model.pkl', 'rb') as f:
    gb_model = pickle.load(f)

#GB Predictions as Feature
gb_train_predictions = gb_model.predict_proba(X_train)[:, 1].reshape(-1, 1)
gb_test_predictions = gb_model.predict_proba(X_test)[:, 1].reshape(-1, 1)

#Combine GB Predictions with Input Features
X_train_with_gb = np.hstack((gb_train_predictions, X_train))
X_test_with_gb = np.hstack((gb_test_predictions, X_test))

#Convert to DataFrame
X_train_with_gb = pd.DataFrame(X_train_with_gb)
X_test_with_gb = pd.DataFrame(X_test_with_gb)

#Train ANN
input_shape = (X_train_with_gb.shape[1],)
ann = build_ann(input_shape)
history = ann.fit(
    X_train_with_gb.to_numpy(), y_train.to_numpy(), 
    epochs=50, batch_size=32, validation_data=(X_test_with_gb.to_numpy(), y_test.to_numpy())
)

#Evaluate ANN
val_loss, val_accuracy = ann.evaluate(X_test_with_gb.to_numpy(), y_test.to_numpy())
print(f"Validation Loss: {val_loss:.4f}, Validation Accuracy: {val_accuracy:.4f}")

#Save ANN Model
ann.save('ann_bank_trans_fraud_detection.keras')
print("ANN model saved as ann_bank_trans_fraud_detection.keras")
