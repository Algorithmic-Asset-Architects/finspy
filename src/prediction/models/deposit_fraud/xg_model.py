import pandas as pd
import numpy as np
import pickle
import matplotlib.pyplot as plt
import warnings
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import StandardScaler, LabelEncoder
from imblearn.over_sampling import SMOTE
from xgboost import XGBClassifier
from sklearn.metrics import classification_report, confusion_matrix

warnings.filterwarnings('ignore')

# Define the parameter grid
param_grid = {
    'n_estimators': [50, 100, 200],
    'max_depth': [3, 5, 7],
    'learning_rate': [0.01, 0.1, 0.2],
    'subsample': [0.6, 0.8, 1.0],
    'colsample_bytree': [0.6, 0.8, 1.0],
}

# Load the dataset
file_path = 'data/DirectDepositFraud_Data.csv'
data = pd.read_csv(file_path)

# Data Preprocessing
label_enc = LabelEncoder()
data['transactionType'] = label_enc.fit_transform(data['transactionType'])
data = data.drop(columns=['Step', 'startingClient', 'destinationClient'])
with open('dep_encoders.pkl', 'wb') as f:
    pickle.dump(label_enc, f)

X = data.drop('isfraud', axis=1)
y = data['isfraud']
feature_names = X.columns.tolist()  # Save feature names for later

# Scale numerical features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)
with open('dep_scaler.pkl', 'wb') as f:
    pickle.dump(scaler, f)

# Handle class imbalance using SMOTE
smote = SMOTE(random_state=42)
X_resampled, y_resampled = smote.fit_resample(X_scaled, y)

# Split dataset
X_train, X_test, y_train, y_test = train_test_split(X_resampled, y_resampled, test_size=0.2, random_state=42)

# Hyperparameter tuning
xgb = XGBClassifier(random_state=42, use_label_encoder=False, eval_metric='logloss')

grid_search = GridSearchCV(
    estimator=xgb,
    param_grid=param_grid,
    scoring='f1',
    cv=3,
    verbose=3,  # Enables progress monitoring
    n_jobs=-1  # Enables parallel processing
)
grid_search.fit(X_train, y_train)

# Get the best parameters and model
best_params = grid_search.best_params_
print("Best Hyperparameters:", best_params)
best_model = grid_search.best_estimator_

# Model Evaluation
y_pred_tuned = best_model.predict(X_test)

print("Confusion Matrix (Tuned Model):")
print(confusion_matrix(y_test, y_pred_tuned))

print("\nClassification Report (Tuned Model):")
print(classification_report(y_test, y_pred_tuned))

# Feature Importance Analysis
feature_importance = best_model.feature_importances_
sorted_idx = np.argsort(feature_importance)[::-1]

plt.figure(figsize=(10, 6))
plt.barh(range(len(sorted_idx)), feature_importance[sorted_idx], align='center')
plt.yticks(range(len(sorted_idx)), [feature_names[i] for i in sorted_idx])
plt.xlabel("Feature Importance")
plt.ylabel("Feature")
plt.title("Feature Importance in Fraud Detection")
plt.gca().invert_yaxis()
plt.show()

# Save the trained model
with open('dep_xgboost_model.pkl', 'wb') as f:
    pickle.dump(best_model, f)

# Print input features
print("\nFeatures used as input to the model:")
for idx, feature in enumerate(feature_names):
    print(f"{idx + 1}. {feature}")
