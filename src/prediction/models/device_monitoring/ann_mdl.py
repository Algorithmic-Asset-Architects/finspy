import pandas as pd
import numpy as np
import pickle
from keras.models import Model
from imblearn.over_sampling import SMOTE
from keras.layers import Input, Dense, Dropout
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler

#Build ANN
def build_ann(input_shape):
    #Input Layer
    inp_layer = Input(shape=input_shape)
    #Hidden Layers
    x = Dense(64, activation='relu')(inp_layer)
    x = Dropout(0.3)(x)
    x = Dense(32, activation='relu')(x)
    x = Dropout(0.3)(x)
    #Output Layer
    out_layer = Dense(1, activation='sigmoid')(x)
    model = Model(inputs=inp_layer, outputs=out_layer)
    model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
    return model

#Load dataset
data_file = "data1.csv"
df = pd.read_csv(data_file)

#Target and features
target = 'fraud_bool'
X = df.drop(columns=[target])
y = df[target]

#Encode cat vars
with open('encoders.pkl', 'rb') as en_file:
    encoders = pickle.load(en_file)
for col, encoder in encoders.items():
    if col in X.columns:
        X[col] = encoder.transform(X[col])

#Handle missing values
X.replace(-1, np.nan, inplace=True)
X.fillna(X.mean(), inplace=True)

#Scale features
with open('scaler.pkl', 'rb') as file:
    scaler = pickle.load(file)
X_scaled = pd.DataFrame(scaler.transform(X), columns=X.columns)

#Split into train and test
X_train, X_val, y_train, y_val = train_test_split(X_scaled, y, test_size=0.2, random_state=42)

#Class Imbalance Handling using SMOTE
smote = SMOTE(random_state=42)
X_train_resampled, y_train_resampled = smote.fit_resample(X_train, y_train)

#XGBoost added as feature for hybrid model
with open('fraud_detection_model.pkl', 'rb') as file:
    xgb_model = pickle.load(file)

#Add XGBoost predictions as a feature
xgb_train_predictions = xgb_model.predict_proba(X_train_resampled)[:, 1].reshape(-1, 1)
xgb_val_predictions = xgb_model.predict_proba(X_val)[:, 1].reshape(-1, 1)

#XGBoost + input features
X_train_with_xgb = np.hstack((xgb_train_predictions, X_train_resampled))
X_val_with_xgb = np.hstack((xgb_val_predictions, X_val))

#Train ANN
input_shape = (X_train_with_xgb.shape[1],)
ann = build_ann(input_shape)
history = ann.fit(X_train_with_xgb, y_train_resampled, epochs=50, batch_size=32, validation_data=(X_val_with_xgb, y_val))

#Evaluate ANN
val_loss, val_accuracy = ann.evaluate(X_val_with_xgb, y_val)
print(f"Validation Loss: {val_loss:.4f}, Validation Accuracy: {val_accuracy:.4f}")

#Save ANN model
ann.save('ann_fraud_detection.keras')
print("ANN model saved as ann_fraud_detection.keras")
