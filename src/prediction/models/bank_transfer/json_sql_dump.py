import json
import psycopg2

def insert_to_table(json_path, db_config):
    attributes = [
        'step', 'type', 'amount', 'nameOrig', 'oldbalanceOrg', 'newbalanceOrig', 'nameDest', 'oldbalanceDest',
        'newbalanceDest',  'fraud_probability', 'is_fraud'
        ]
    
    columns = ', '.join(attributes)
    columns = columns.replace('type', 't_type')
    placeholders = ', '.join(['%s']*len(attributes))
    
    insert_query = f"INSERT INTO bank_trans_tab ({columns}) VALUES ({placeholders})"
    
    try:
        conn = psycopg2.connect(**db_config)
        cur = conn.cursor()
        
        with open(json_path, 'r') as f:
            data = json.load(f)
        
        if not isinstance(data, list):
            raise ValueError("JSON file should contain a list of transactions")
        
        for transaction in data:
            values = tuple(transaction.get(attr, None) for attr in attributes)
            cur.execute(insert_query, values)
        conn.commit()
        cur.close()
        conn.close()
        print("Data inserted successfully")
    except Exception as e:
        print(f"Error: {e}")
        
db_config = {
    "dbname": "client_share",
    "user": "postgres",
    "password": "pokemon#123",
    "host": "client-share.cjw8m0ouiwh0.eu-north-1.rds.amazonaws.com",
    "port": "5432",
}