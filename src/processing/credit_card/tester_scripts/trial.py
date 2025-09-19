import pandas as pd
import numpy as np
import pickle
from imblearn.over_sampling import SMOTE
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score, accuracy_score
from xgboost import XGBClassifier

# Step 1: Load the datasets
train_data = pd.read_csv('fraudTrain_updated.csv')
test_data = pd.read_csv('fraudTest_updated.csv')

# Step 2: Preprocess the data
def preprocess_data(data):
    # Drop irrelevant columns
    data = data.drop(columns=['index', 'trans_date_trans_time', 'cc_num', 'first', 'last', 
                               'street', 'city', 'state', 'zip', 'job', 'dob', 'trans_num'])
    
    # Fill missing values (if any)
    data = data.fillna(0)
    
    # Convert categorical data to numeric using one-hot encoding
    data = pd.get_dummies(data, columns=['merchant', 'category', 'gender'], drop_first=True)
    
    return data

# Preprocess train and test data
train_data = preprocess_data(train_data)
test_data = preprocess_data(test_data)

# Step 3: Split data into features and target
X_train = train_data.drop(columns=['is_fraud'])
y_train = train_data['is_fraud']
X_test = test_data.drop(columns=['is_fraud'])
y_test = test_data['is_fraud']

'''
smote = SMOTE(random_state=42)
X_train_smote, y_train_smote = smote.fit_resample(X_train, y_train)
'''

# Step 4: Train the XGBoost model
model = XGBClassifier(
    objective='binary:logistic',
    eval_metric='auc',
    use_label_encoder=False,
    random_state=42
)

#model.fit(X_train_smote, y_train_smote)
model.fit(X_train, y_train)

# Step 5: Make predictions and evaluate
y_pred = model.predict(X_test)
y_pred_proba = model.predict_proba(X_test)[:, 1]

print("\nClassification Report:")
print(classification_report(y_test, y_pred))

print("\nConfusion Matrix:")
print(confusion_matrix(y_test, y_pred))

print("\nROC-AUC Score:")
print(roc_auc_score(y_test, y_pred_proba))

print("\nAccuracy Score:")
print(accuracy_score(y_test, y_pred))

with open('nandu.pkl', 'wb') as file:
    pickle.dump(model, file)
    print("Saved model successfully")