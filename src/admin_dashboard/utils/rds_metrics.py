import boto3
import datetime
from django.conf import settings

# iit cloudwatch agent
cloudwatch = boto3.client(
    "cloudwatch",
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    region_name=settings.AWS_REGION,
)

def get_rds_metrics(metric_name, period=300, duration=3600):
    # get RDS metrics from bezoz
    end_time = datetime.datetime.utcnow()
    start_time = end_time - datetime.timedelta(seconds=duration)  # todo 1 hour

    response = cloudwatch.get_metric_statistics(
        Namespace="AWS/RDS",
        MetricName=metric_name,
        Dimensions=[{"Name": "DBInstanceIdentifier", "Value": settings.AWS_RDS_INSTANCE_ID}],
        StartTime=start_time,
        EndTime=end_time,
        Period=period,
        Statistics=["Average"]
    )
    print(response)

    if "Datapoints" in response and response["Datapoints"]:
        return sorted(response["Datapoints"], key=lambda x: x["Timestamp"], reverse=True)[0]["Average"]
    return None
