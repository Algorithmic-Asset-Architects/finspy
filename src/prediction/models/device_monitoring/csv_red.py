import pandas as pd

# Load the CSV file
df = pd.read_csv("data1.csv")

# Rename the column
df.rename(columns={"month": "cr_month"}, inplace=True)

# Save the updated file (overwrite or create a new one)
df.to_csv("data1.csv", index=False)  # Overwrites the file
# df.to_csv("data1_updated.csv", index=False)  # Use this to save as a new file

print("Column 'month' renamed to 'cr_month' successfully.")
