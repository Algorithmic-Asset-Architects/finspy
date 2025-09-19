import pandas as pd
import numpy as np
import pickle
import warnings
import matplotlib.pyplot as plt
from dimens import data_dict
from prep_dat import preprocess_data, fix_indexing, print_features
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score, accuracy_score
from sklearn.preprocessing import LabelEncoder, StandardScaler
from xgboost import XGBClassifier
from imblearn.over_sampling import SMOTE

warnings.filterwarnings("ignore")

# Read dataset
train_csv = 'fraudTrain.csv'
test_csv = 'fraudTest.csv'
fix_indexing(train_csv)
fix_indexing(test_csv)
train_dat = pd.read_csv('fraudTrain_updated.csv')
test_dat = pd.read_csv('fraudTest_updated.csv')

train_dat = preprocess_data(train_dat)
test_dat = preprocess_data(test_dat)
print_features('fraudTrain_updated.csv', data_dict)

# Data split
X_train = train_dat.drop(columns=['is_fraud'])
y_train = train_dat['is_fraud']
X_test = test_dat.drop(columns=['is_fraud'])
y_test = test_dat['is_fraud']

# Encode and Scale
encoders = {}
cat_cols = X_train.select_dtypes(include=['object']).columns

for col in cat_cols:
    le = LabelEncoder()
    X_train[col] = le.fit_transform(X_train[col])
    X_test[col] = le.transform(X_test[col])
    encoders[col] = le

with open('encoders.pkl', 'wb') as en_file:
    pickle.dump(encoders, en_file)

scaler = StandardScaler()
X_train = pd.DataFrame(scaler.fit_transform(X_train), columns=X_train.columns)
X_test = pd.DataFrame(scaler.transform(X_test), columns=X_test.columns)

with open('scalar.pkl', 'wb') as sc_file:
    pickle.dump(scaler, sc_file)

# Apply SMOTE to balance the dataset
smote = SMOTE(random_state=42)
X_train, y_train = smote.fit_resample(X_train, y_train)

print("After SMOTE, counts of label '1': {}".format(sum(y_train == 1)))
print("After SMOTE, counts of label '0': {}".format(sum(y_train == 0)))

# Init model
xg_model = XGBClassifier(
    objective='binary:logistic',
    eval_metric='logloss',
    use_label_encoder=False,
    random_state=42
)

# Train model
eval_set = [(X_train, y_train), (X_test, y_test)]
results = {}
xg_model.fit(X_train, y_train, eval_set=eval_set, verbose=True)

# Predict model
y_pred = xg_model.predict(X_test)
y_pred_proba = xg_model.predict_proba(X_test)[:, 1]

# Model evaluation
print("\nClassification Report:")
print(classification_report(y_test, y_pred))

print("\nConfusion Matrix:")
print(confusion_matrix(y_test, y_pred))

print("\nROC-AUC Score:")
print(roc_auc_score(y_test, y_pred_proba))

print("\nAccuracy Score:")
print(accuracy_score(y_test, y_pred))

# Plotting validation and training loss
plt.figure(figsize=(10, 6))
plt.plot(xg_model.evals_result()['validation_0']['logloss'], label='Training Log Loss')
plt.plot(xg_model.evals_result()['validation_1']['logloss'], label='Validation Log Loss')
plt.xlabel('Epochs')
plt.ylabel('Log Loss')
plt.title('Training vs Validation Log Loss')
plt.legend()
plt.grid()
plt.show()

# Save model
with open('cred_xgboost_model.pkl', 'wb') as file:
    pickle.dump(xg_model, file)
    print('Model saved successfully')
