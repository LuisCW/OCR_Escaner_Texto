import boto3
import json

# Configurar credenciales
aws_access_key_id = "Insert Access Key ID"
aws_secret_access_key = "Insert Access Key Secret"
region = "us-east-1"

def fix_lambda_permissions():
    """Corregir permisos de Lambda para S3"""
    session = boto3.Session(
        aws_access_key_id=aws_access_key_id,
        aws_secret_access_key=aws_secret_access_key,
        region_name=region
    )
    
    iam = session.client('iam')
    
    # Policy mejorada para Lambda
    enhanced_policy = {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Action": [
                    "logs:CreateLogGroup",
                    "logs:CreateLogStream",
                    "logs:PutLogEvents"
                ],
                "Resource": "arn:aws:logs:*:*:*"
            },
            {
                "Effect": "Allow",
                "Action": [
                    "textract:DetectDocumentText",
                    "textract:AnalyzeDocument"
                ],
                "Resource": "*"
            },
            {
                "Effect": "Allow",
                "Action": [
                    "s3:GetObject",
                    "s3:PutObject",
                    "s3:GetBucketLocation",
                    "s3:ListBucket"
                ],
                "Resource": [
                    "arn:aws:s3:::ocr-escaner-word",
                    "arn:aws:s3:::ocr-escaner-word/*"
                ]
            }
        ]
    }
    
    try:
        # Actualizar policy del rol
        iam.put_role_policy(
            RoleName="ocr-lambda-role",
            PolicyName="OCRLambdaPolicy",
            PolicyDocument=json.dumps(enhanced_policy)
        )
        print("✅ Permisos de Lambda actualizados")
        
        return True
        
    except Exception as e:
        print(f"❌ Error actualizando permisos: {e}")
        return False

def check_bucket_permissions():
    """Verificar permisos del bucket"""
    session = boto3.Session(
        aws_access_key_id=aws_access_key_id,
        aws_secret_access_key=aws_secret_access_key,
        region_name=region
    )
    
    s3 = session.client('s3')
    
    try:
        # Verificar que el bucket existe
        s3.head_bucket(Bucket='ocr-escaner-word')
        print("✅ Bucket ocr-escaner-word accesible")
        
        # Listar objetos para verificar permisos
        objects = s3.list_objects_v2(Bucket='ocr-escaner-word', MaxKeys=1)
        print(f"✅ Permisos de listado funcionan")
        
        return True
        
    except Exception as e:
        print(f"❌ Error con bucket: {e}")
        return False

def main():
    print("🔧 Corrigiendo permisos de S3 y Lambda...")
    
    if check_bucket_permissions():
        if fix_lambda_permissions():
            print("\n✅ Permisos corregidos")
            print("⏳ Esperando propagación de permisos...")
            import time
            time.sleep(10)
            print("🧪 Listo para probar nuevamente")
        else:
            print("\n❌ Error corrigiendo permisos")
    else:
        print("\n❌ Problema con acceso al bucket")

if __name__ == "__main__":
    main()
