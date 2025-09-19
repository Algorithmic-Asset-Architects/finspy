import pandas as pd
import numpy as np
import pickle
from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import classification_report, roc_auc_score
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.utils import resample

#Dataset loading
data = pd.read_csv('data2.csv')

#Cleaning data
data.fillna(0, inplace=True)

#Creation of new features
data['balance_delta_orig'] = data['oldbalanceOrg'] - data['newbalanceOrig']
data['balance_delta_dest'] = data['oldbalanceDest'] - data['newbalanceDest']
data['transaction_ratio'] = data['amount'] / (data['oldbalanceOrg'] + 1)

#Categorical encoding
label_encoders = {}
for col in ['type']:
    le = LabelEncoder()
    data[col] = le.fit_transform(data[col])
    label_encoders[col] = le
    
with open('label_encoders.pkl', 'wb') as f:
    pickle.dump(label_encoders, f)

#Targets
target = 'isFraud'
features = [col for col in data.columns if col not in ['isFraud', 'isFlaggedFraud', 'nameOrig', 'nameDest']]

X = data[features]
y = data[target]

#Imbalance correction
fraud = data[data[target] == 1]
non_fraud = data[data[target] == 0]

#Minority upsample
fraud_upsampled = resample(fraud, replace=True, n_samples=len(non_fraud), random_state=42)
balanced_data = pd.concat([fraud_upsampled, non_fraud])
X = balanced_data[features]
y = balanced_data[target]

#Train and test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)

#Scaling
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)
with open('trans_scal.pkl', 'wb') as f:
    pickle.dump(scaler, f)

#Model init and training
model = GradientBoostingClassifier(random_state=42)
model.fit(X_train, y_train)

#Evaluation
y_pred = model.predict(X_test)
print(classification_report(y_test, y_pred))
print("AUC-ROC:", roc_auc_score(y_test, model.predict_proba(X_test)[:, 1]))

#Add to pickle jar
with open('fraud_detection_model.pkl', 'wb') as f:
    pickle.dump(model, f)

#Print the selected features
print("Features used for the model:", features)
