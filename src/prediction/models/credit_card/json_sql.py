import json
import psycopg2
from datetime import datetime

def insert_to_table(json_path, db_config):
    attributes = [
        'index', 'trans_date_trans_time', 'cc_num', 'merchant', 'category', 'amt', 'first', 'last',
        'gender', 'street', 'city', 'state', 'zip', 'lat', 'long', 'city_pop', 'job',
        'dob', 'trans_num', 'unix_time', 'merch_lat', 'merch_long', 'fraud_probability', 'is_fraud'
    ]
    
    columns = ', '.join(attributes)
    columns = columns.replace('index', 't_index')
    columns = columns.replace('first', 'first_name')
    columns = columns.replace('last', 'last_name')
    columns = columns.replace('state', 'geo_state')
    placeholders = ', '.join(['%s'] * len(attributes))
    
    insert_query = f"INSERT INTO cred_card_tab ({columns}) VALUES ({placeholders})"
    
    try:
        conn = psycopg2.connect(**db_config)
        cur = conn.cursor()
        
        with open(json_path, 'r') as f:
            data = json.load(f)
        
        if not isinstance(data, list):
            raise ValueError("JSON file should contain a list of transactions")
        
        for transaction in data:
            values = []
            for attr in attributes:
                value = transaction.get(attr, None)
                
                # Handle date format conversion for 'trans_date_trans_time'
                if attr == 'trans_date_trans_time' and value:
                    try:
                        value = datetime.strptime(value, "%d-%m-%Y %H:%M").strftime("%Y-%m-%d %H:%M:%S")
                    except ValueError as ve:
                        print(f"Date format error for value '{value}': {ve}")
                        value = None
                
                # Handle date of birth conversion if needed
                if attr == 'dob' and value:
                    try:
                        value = datetime.strptime(value, "%d-%m-%Y").strftime("%Y-%m-%d")
                    except ValueError as ve:
                        print(f"Date format error for DOB '{value}': {ve}")
                        value = None
                
                values.append(value)
            
            cur.execute(insert_query, tuple(values))
        
        conn.commit()
        cur.close()
        conn.close()
        print("Data inserted successfully.")
    
    except Exception as e:
        print(f"Error: {e}")

db_config = {
    "dbname": "client_share",
    "user": "postgres",
    "password": "pokemon#123",
    "host": "client-share.cjw8m0ouiwh0.eu-north-1.rds.amazonaws.com",
    "port": "5432",
}
