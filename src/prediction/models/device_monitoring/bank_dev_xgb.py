import pandas as pd
import numpy as np
import xgboost as xgb
import pickle
import warnings
from dimens import param_grid
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
from sklearn.preprocessing import LabelEncoder, StandardScaler

warnings.filterwarnings("ignore")

#Dataset loading
data_file = "data1.csv"
df = pd.read_csv(data_file)

#Split target and features
target = 'fraud_bool'
X = df.drop(columns=[target])
y = df[target]

encoders = {}
#Preprocessing
#Encoding categorical variables
for col in X.select_dtypes(include=['object']).columns:
    le = LabelEncoder()
    X[col] = le.fit_transform(X[col])
    encoders[col] = le
with open('encoders.pkl', 'wb') as en_file:
    pickle.dump(encoders, en_file)

#Missing values
X.replace(-1, np.nan, inplace=True)
X.fillna(X.mean(), inplace=True)

#Scaling
scaler = StandardScaler()
X = pd.DataFrame(scaler.fit_transform(X), columns=X.columns)
with open('scaler.pkl', 'wb') as sc_file:
    pickle.dump(scaler, sc_file)

#Splitting into train and test
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

#GridSearchCV
xgb_model = xgb.XGBClassifier(objective='binary:logistic', eval_metric='logloss', use_label_encoder=False)
grid_search = GridSearchCV(estimator=xgb_model, param_grid=param_grid, cv=3, scoring='accuracy', verbose=1)
grid_search.fit(X_train, y_train)

#Best model
best_params = grid_search.best_params_
best_model = grid_search.best_estimator_

print("\nBest Parameters from GridSearchCV:")
print(best_params)

#Evaluate model
y_pred = best_model.predict(X_test)

print("\nPerformance Metrics:")
print("Accuracy:", accuracy_score(y_test, y_pred))
print("Confusion Matrix:\n", confusion_matrix(y_test, y_pred))
print("Classification Report:\n", classification_report(y_test, y_pred))

pickle_file = "fraud_detection_model.pkl"
with open(pickle_file, 'wb') as f:
    pickle.dump(best_model, f)
print(f"\nModel saved as {pickle_file}")

print("\nInput Features Used for Training:")
print(X.columns.tolist())