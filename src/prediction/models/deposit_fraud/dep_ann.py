import pandas as pd
import numpy as np
import pickle
from keras.models import Model
from imblearn.over_sampling import SMOTE
from keras.layers import Input, Dense, Dropout
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from xgboost import XGBClassifier

#Build ANN
def build_ann(input_shape):
    #Input layer
    inp_layer = Input(shape=input_shape)
    
    #Hidden layers
    x = Dense(64, activation='relu')(inp_layer)
    x = Dropout(0.3)(x)
    x = Dense(32, activation='relu')(x)
    x = Dropout(0.3)(x)
    
    #Output layer
    out_layer = Dense(1, activation='sigmoid')(x)
    model = Model(inputs=inp_layer, outputs=out_layer)
    model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
    return model

#Dataset loading
file_path = 'data/DirectDepositFraud_Data.csv'
data = pd.read_csv(file_path)
data = data.drop(columns=['Step', 'startingClient', 'destinationClient'])

#Encode categorical variables
with open('dep_encoders.pkl', 'rb') as f:
    label_enc = pickle.load(f)
data['transactionType'] = label_enc.transform(data['transactionType'])

#Target and Features
X = data.drop('isfraud', axis=1)
y = data['isfraud']

#Handle missing values
X.replace(-1, np.nan, inplace=True)
X.fillna(X.mean(), inplace=True)

#Scale features
with open('dep_scaler.pkl', 'rb') as f:
    scaler = pickle.load(f)
X_scaled = scaler.transform(X)

#Handle class imbalance using SMOTE
smote = SMOTE(random_state=42)
X_resampled, y_resampled = smote.fit_resample(X_scaled, y)

#Split dataset
X_train, X_test, y_train, y_test = train_test_split(X_resampled, y_resampled, test_size=0.2, random_state=42)

with open('dep_xgboost_model.pkl', 'rb') as f:
    xgb_model = pickle.load(f)
    
#Add XGBoost as feature for hybrid model
xgb_train_preds = xgb_model.predict_proba(X_train)[:, 1].reshape(-1, 1)
xgb_val_preds = xgb_model.predict_proba(X_test)[:, 1].reshape(-1, 1)

#XGBoost + Input Features
X_train_with_xgb = np.hstack((xgb_train_preds, X_train))
X_test_with_xgb = np.hstack((xgb_val_preds, X_test))

#Model Training
input_shape = (X_train_with_xgb.shape[1],)
ann = build_ann(input_shape)
history = ann.fit(X_train_with_xgb, y_train, epochs=50, batch_size=32, validation_data=(X_test_with_xgb, y_test))

#Evaluate model
val_loss, val_accuracy = ann.evaluate(X_test_with_xgb, y_test)
print(f"Validation Loss: {val_loss}, Validation Accuracy: {val_accuracy}")

#Save model
ann.save('dep_ann_model.keras')