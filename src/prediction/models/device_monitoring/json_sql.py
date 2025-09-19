import json
import psycopg2

def insert_to_table(json_path, db_config):
    attributes = [
        'income', 'name_email_similarity', 'prev_address_months_count', 'current_address_months_count', 
        'customer_age', 'days_since_request', 'intended_balcon_amount', 'payment_type', 'zip_count_4w', 
        'velocity_6h', 'velocity_24h', 'velocity_4w', 'bank_branch_count_8w', 'date_of_birth_distinct_emails_4w', 
        'employment_status', 'credit_risk_score', 'email_is_free', 'housing_status', 'phone_home_valid', 
        'phone_mobile_valid', 'bank_months_count', 'has_other_cards', 'proposed_credit_limit', 'foreign_request', 
        'source', 'session_length_in_minutes', 'device_os', 'keep_alive_session', 'device_distinct_emails_8w', 
        'device_fraud_count', 'cr_month', 'fraud_probability', 'is_fraud'
    ]
    columns = ', '.join(attributes)
    placeholders = ', '.join(['%s']*len(attributes))
    
    insert_query = f"INSERT INTO bank_dev_mon_tab ({columns}) VALUES ({placeholders})"
    
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

insert_to_table('out_ex1.json', db_config)