from django.db import models

class ExistingCreditCardTransaction(models.Model):
    t_index = models.IntegerField(primary_key=True)  # Explicit primary key to avoid 'id' issues
    trans_date_trans_time = models.DateTimeField(null=True, blank=True)
    cc_num = models.CharField(max_length=20, null=True, blank=True)
    merchant = models.CharField(max_length=255, null=True, blank=True)
    category = models.CharField(max_length=100, null=True, blank=True)
    amt = models.FloatField(null=True, blank=True)
    city_pop = models.IntegerField(null=True, blank=True)
    lat = models.FloatField(null=True, blank=True)
    long = models.FloatField(null=True, blank=True)
    unix_time = models.BigIntegerField(null=True, blank=True)
    merch_lat = models.FloatField(null=True, blank=True)
    merch_long = models.FloatField(null=True, blank=True)
    fraud_probability = models.FloatField(null=True, blank=True)
    is_fraud = models.BooleanField(default=False)

    class Meta:
        db_table = 'cred_card_tab'  # Existing table name in your PostgreSQL database
        managed = False  # Prevent Django from managing the table


#--------------------------------------------------------------


class DeviceMonitoringTransaction(models.Model):
    trn_id = models.BigAutoField(primary_key=True)
    income = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    name_email_similarity = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    prev_address_months_count = models.IntegerField(null=True, blank=True)
    current_address_months_count = models.IntegerField(null=True, blank=True)
    customer_age = models.IntegerField(null=True, blank=True)
    days_since_request = models.IntegerField(null=True, blank=True)
    intended_balcon_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    payment_type = models.CharField(max_length=5, null=True, blank=True)
    zip_count_4w = models.IntegerField(null=True, blank=True)
    velocity_6h = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    velocity_24h = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    velocity_4w = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    bank_branch_count_8w = models.IntegerField(null=True, blank=True)
    date_of_birth_distinct_emails_4w = models.IntegerField(null=True, blank=True)
    employment_status = models.CharField(max_length=5, null=True, blank=True)
    credit_risk_score = models.IntegerField(null=True, blank=True)
    email_is_free = models.IntegerField(null=True, blank=True)
    housing_status = models.CharField(max_length=5, null=True, blank=True)
    phone_home_valid = models.IntegerField(null=True, blank=True)
    phone_mobile_valid = models.IntegerField(null=True, blank=True)
    bank_months_count = models.IntegerField(null=True, blank=True)
    has_other_cards = models.IntegerField(null=True, blank=True)
    proposed_credit_limit = models.IntegerField(null=True, blank=True)
    foreign_request = models.IntegerField(null=True, blank=True)
    source = models.CharField(max_length=50, null=True, blank=True)
    session_length_in_minutes = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    device_os = models.CharField(max_length=50, null=True, blank=True)
    keep_alive_session = models.IntegerField(null=True, blank=True)
    device_distinct_emails_8w = models.IntegerField(null=True, blank=True)
    device_fraud_count = models.IntegerField(null=True, blank=True)
    cr_month = models.IntegerField(null=True, blank=True)
    fraud_probability = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True)
    is_fraud = models.BooleanField(default=False)

    class Meta:
        db_table = 'bank_dev_mon_tab'  # Map to existing PostgreSQL table
        managed = False  # Django should not manage this table


#--------------------------------------------------------------------------------


class BankTransaction(models.Model):
    trn_id = models.BigAutoField(primary_key=True)  # Primary key from table
    step = models.IntegerField(null=True, blank=True)
    t_type = models.CharField(max_length=50, null=True, blank=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    nameorig = models.CharField(max_length=50, null=True, blank=True)
    oldbalanceorg = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    # Use db_column to map our field to the correct table column "newbalanceorig"
    newbalanceorg = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True, db_column="newbalanceorig"
    )
    namedest = models.CharField(max_length=50, null=True, blank=True)
    oldbalancedest = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    newbalancedest = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    fraud_probability = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True)
    is_fraud = models.BooleanField(default=False)

    class Meta:
        db_table = 'bank_trans_tab'  # Map to the existing table
        managed = False             # Do not let Django manage this table

    def __str__(self):
        return f"Transaction {self.trn_id} - {self.t_type}"



# -------------------------------------------------------------------------


class CreditCardTransaction(models.Model):
    tr_id = models.BigAutoField(primary_key=True)  # Primary key from table
    t_index = models.IntegerField(null=True, blank=True)
    trans_date_trans_time = models.DateTimeField(null=True, blank=True)
    cc_num = models.DecimalField(max_digits=20, decimal_places=0, null=True, blank=True)
    merchant = models.CharField(max_length=100, null=True, blank=True)
    category = models.CharField(max_length=100, null=True, blank=True)
    amt = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    first_name = models.CharField(max_length=100, null=True, blank=True)
    last_name = models.CharField(max_length=100, null=True, blank=True)
    gender = models.CharField(max_length=1, null=True, blank=True)
    street = models.CharField(max_length=100, null=True, blank=True)
    city = models.CharField(max_length=100, null=True, blank=True)
    geo_state = models.CharField(max_length=2, null=True, blank=True)
    zip = models.DecimalField(max_digits=10, decimal_places=0, null=True, blank=True)
    lat = models.DecimalField(max_digits=10, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=10, decimal_places=6, null=True, blank=True, db_column="long")
    city_pop = models.DecimalField(max_digits=12, decimal_places=0, null=True, blank=True)
    job = models.CharField(max_length=100, null=True, blank=True)
    dob = models.DateField(null=True, blank=True)
    trans_num = models.CharField(max_length=20, null=True, blank=True)
    unix_time = models.BigIntegerField(null=True, blank=True)
    merch_lat = models.DecimalField(max_digits=10, decimal_places=6, null=True, blank=True)
    merch_long = models.DecimalField(max_digits=10, decimal_places=6, null=True, blank=True)
    fraud_probability = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True)
    is_fraud = models.BooleanField(null=True, blank=True)

    class Meta:
        db_table = "cred_card_tab"  # Maps to the existing table
        managed = False            # Let the database manage the table

    def __str__(self):
        return f"Credit Card Transaction {self.tr_id} - {self.t_type}"

#--------------------------------------------------------------------------------


class DepositFraudTransaction(models.Model):
    tr_id = models.BigAutoField(primary_key=True)
    step = models.IntegerField(null=True, blank=True)
    transactiontype = models.CharField(max_length=50, null=True, blank=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    startingclient = models.CharField(max_length=50, null=True, blank=True)
    oldbalstartingclient = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    newbalstartingclient = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    destinationclient = models.CharField(max_length=50, null=True, blank=True)
    oldbaldestclient = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    newbaldestclient = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    fraud_probability = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True)
    is_fraud = models.BooleanField(null=True, blank=True)

    class Meta:
        db_table = "dep_fraud_tab"
        managed = False  # Since the table already exists

    def __str__(self):
        return f"Deposit Fraud Transaction {self.tr_id} - {self.transactiontype}"
