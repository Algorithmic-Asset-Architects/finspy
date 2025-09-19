import json

# Define the sample input data for the XGBoost model
sample_data = {
    "merchant": "fraud_Rippin, Kub and Mann",
    "category": "misc_net",
    "amt": 4.97,
    "gender": "F",
    "lat": 36.0788,
    "long": -81.1781,
    "city_pop": 3495,
    "unix_time": 1325376018,
    "merch_lat": 36.011293,
    "merch_long": -82.048315
}

# Save the sample data as a JSON file
output_file = "xgboost_sample_input.json"
with open(output_file, "w") as file:
    json.dump(sample_data, file, indent=4)

print(f"Sample input JSON saved to {output_file}")
