import pandas as pd
import numpy as np
import pickle
from prep_dat import preprocess_data
from keras.models import Model
from imblearn.over_sampling import SMOTE
from keras.layers import Input, Dense, Dropout
from sklearn.preprocessing import LabelEncoder, StandardScaler

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

# Load and preprocess data
df1 = preprocess_data(pd.read_csv('fraudTrain_updated.csv'))
df2 = preprocess_data(pd.read_csv('fraudTest_updated.csv'))

target = 'is_fraud'
X_train = df1.drop(columns=[target])
y_train = df1[target]
X_test = df2.drop(columns=[target])
y_test = df2[target]

# Encoding and Scaling
with open('encoders.pkl', 'rb') as en_file:
    encoders = pickle.load(en_file)

for col, encoder in encoders.items():
    if col in X_train.columns:
        X_train[col] = encoder.transform(X_train[col])
        X_test[col] = encoder.transform(X_test[col])

X_train.replace(-1, np.nan, inplace=True)
X_test.replace(-1, np.nan, inplace=True)
X_train.fillna(X_train.mean(), inplace=True)
X_test.fillna(X_test.mean(), inplace=True)

with open('scalar.pkl', 'rb') as file:
    scaler = pickle.load(file)
X_train_scaled = pd.DataFrame(scaler.transform(X_train), columns=X_train.columns)
X_test_scaled = pd.DataFrame(scaler.transform(X_test), columns=X_test.columns)

# Apply SMOTE for balancing the dataset
smote = SMOTE(random_state=42)
X_train_resampled, y_train_resampled = smote.fit_resample(X_train_scaled, y_train)

# Load XGBoost model
with open('cred_xgboost_model.pkl', 'rb') as file:
    xgb_model = pickle.load(file)

# Generate predictions from XGBoost for ANN input
xgb_train_predictions = xgb_model.predict_proba(X_train_resampled)[:, 1].reshape(-1, 1)
xgb_val_predictions = xgb_model.predict_proba(X_test_scaled)[:, 1].reshape(-1, 1)

# Concatenate XGBoost predictions with scaled features
X_train_with_xgb = np.hstack((xgb_train_predictions, X_train_resampled))
X_val_with_xgb = np.hstack((xgb_val_predictions, X_test_scaled))

# Build and train the ANN
ann = build_ann(input_shape=(X_train_with_xgb.shape[1],))
history = ann.fit(X_train_with_xgb, y_train_resampled, epochs=50, batch_size=32, 
                  validation_data=(X_val_with_xgb, y_test))

val_loss, val_accuracy = ann.evaluate(X_val_with_xgb, y_test)
print(f"Validation Loss: {val_loss:.4f}, Validation Accuracy: {val_accuracy:.4f}")

ann.save('ann_cc_fraud_det.keras')
print('ANN model saved as ann_cc_fraud_det.keras')
