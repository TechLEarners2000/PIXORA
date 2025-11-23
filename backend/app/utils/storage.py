import boto3
from botocore.exceptions import ClientError
from app.core.config import settings

s3_client = boto3.client(
    "s3",
    endpoint_url=settings.S3_ENDPOINT_URL,
    aws_access_key_id=settings.S3_ACCESS_KEY,
    aws_secret_access_key=settings.S3_SECRET_KEY,
    region_name=settings.S3_REGION_NAME,
)

def upload_file(file_obj, bucket: str, object_name: str) -> bool:
    try:
        s3_client.upload_fileobj(file_obj, bucket, object_name)
    except ClientError as e:
        print(e)
        return False
    return True

def get_presigned_url(bucket: str, object_name: str, expiration=3600) -> str:
    try:
        response = s3_client.generate_presigned_url(
            'get_object',
            Params={'Bucket': bucket, 'Key': object_name},
            ExpiresIn=expiration
        )
    except ClientError as e:
        print(e)
        return ""
    return response

def ensure_buckets():
    try:
        s3_client.create_bucket(Bucket=settings.S3_BUCKET_UPLOADS)
        s3_client.create_bucket(Bucket=settings.S3_BUCKET_ARTIFACTS)
    except ClientError:
        pass # Bucket likely exists
