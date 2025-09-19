param_grid = {
    'n_estimators': [100, 200, 300],
    'learning_rate': [0.01, 0.1, 0.2],
    'max_depth': [4, 6, 8],
    'subsample': [0.8, 1.0],
    'colsample_bytree': [0.8, 1.0]
}


features = ['income', 'name_email_similarity', 'prev_address_months_count', 'current_address_months_count',
            'customer_age', 'days_since_request', 'intended_balcon_amount', 'payment_type', 'zip_count_4w',
            'velocity_6h', 'velocity_24h', 'velocity_4w', 'bank_branch_count_8w', 'date_of_birth_distinct_emails_4w',
            'employment_status', 'credit_risk_score', 'email_is_free', 'housing_status', 'phone_home_valid',
            'phone_mobile_valid', 'bank_months_count', 'has_other_cards', 'proposed_credit_limit', 'foreign_request',
            'source', 'session_length_in_minutes', 'device_os', 'keep_alive_session', 'device_distinct_emails_8w',
            'device_fraud_count', 'cr_month']

categorical_features = ['payment_type', 'employment_status', 'housing_status', 'source', 'device_os']

encoding_map = {
    'payment_type': {'AA': 0, 'AB': 1, 'AC': 2, 'AD': 3, 'AE': 4},
    'employment_status': {'CA': 0, 'CB': 1, 'CC': 2, 'CD': 3, 'CE': 4, 'CF': 5, 'CG': 6},
    'housing_status': {'BA': 0, 'BB': 1, 'BC': 2, 'BD': 3, 'BE': 4, 'BF': 5, 'BG': 6},
    'source': {'INTERNET': 0, 'TELEAPP': 1},
    'device_os': {'linux': 0, 'macintosh': 1, 'windows': 2, 'x11': 3, 'other': 4}
}