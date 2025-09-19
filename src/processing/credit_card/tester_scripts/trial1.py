import pandas as pd
import csv
# Load the CSV file
file_path = 'fraudTrain_updated.csv'  # Replace with your file path if different
train_data = pd.read_csv(file_path)
'''
# Rename the first column to 'inex'
if train_data.columns[0] != 'index':
    train_data.rename(columns={train_data.columns[0]: 'index'}, inplace=True)

# Save the updated CSV file
output_path = 'fraudTest_updated.csv'  # New file or overwrite the same file
train_data.to_csv(output_path, index=False)

print(f"The first column has been renamed to 'inex' and saved to {output_path}.")
'''

import csv
c = 10
with open(file_path, mode ='r')as file:
  csvFile = csv.reader(file)
  for lines in csvFile:
        print(lines)
        c+=1
        if c==15:
            break