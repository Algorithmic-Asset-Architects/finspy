import pandas as pd

def preprocess_data(data):
    # Drop irrelevant or sensitive columns
    data = data.drop(columns=['index', 'trans_date_trans_time', 'cc_num', 'first', 'last', 
                               'street', 'city', 'state', 'zip', 'job', 'dob', 'trans_num'])
    data = data.fillna(0)
    return data

def fix_indexing(file_path):
    train_data = pd.read_csv(file_path)
    if train_data.columns[0] != 'index':
        train_data.rename(columns={train_data.columns[0]: 'index'}, inplace=True)
    output_path = file_path.replace('.csv', '_updated.csv')
    train_data.to_csv(output_path, index=False)
    print(f"The first column has been renamed to 'index' and saved to {output_path}.")

def print_features(file_path, data_dict):
    data = pd.read_csv(file_path)
    columns_to_drop = ['index', 'trans_date_trans_time', 'cc_num', 'first', 'last', 
                       'street', 'city', 'state', 'zip', 'job', 'dob', 'trans_num']
    rem_cols = [col for col in data.columns if col not in columns_to_drop]
    print('Input features: \n')
    for col in rem_cols:
        print(f'{col}: {data_dict.get(col, "Feature description not available")}')
