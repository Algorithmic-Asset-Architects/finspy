import pandas as pd

# Load the CSV file
file_path = 'fraudTrain_updated.csv'  # Replace with your file path
data = pd.read_csv(file_path)

# Define columns to drop
columns_to_drop = ['index', 'trans_date_trans_time', 'cc_num', 'first', 'last', 
                   'street', 'city', 'state', 'zip', 'job', 'dob', 'trans_num']

# Exclude the dropped columns
remaining_columns = [col for col in data.columns if col not in columns_to_drop]

# Print the remaining column headings
print("Remaining Columns:")
for col in remaining_columns:
    print(col)
