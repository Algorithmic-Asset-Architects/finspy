from sklearn.preprocessing import OneHotEncoder
import pandas as pd
import numpy as np
from dimens import categorical_features, encoding_map

def encode_data(data):
    encoded_data = data.copy()
    for feature, mapping in encoding_map.items():
        if feature in data:
            encoded_data[feature] = mapping[data[feature]]
    return encoded_data