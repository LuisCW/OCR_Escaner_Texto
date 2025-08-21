import boto3
import json
import zipfile
import base64
import os
import time

# Configurar credenciales
aws_access_key_id = "AKIA2XAYZBQOXZAHVZOS"
aws_secret_access_key = "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"
region = "us-east-1"

def create_aws_clients():
    """Crear clientes de AWS"""
    session = boto3.Session(
        aws_access_key_id=aws_access_key_id,
        aws_secret_access_key=aws_secret_access_key,
        region_name=region
    )
    
    return {
        's3': session.client('s3'),
        'lambda': session.client('lambda'),
        'apigateway': session.client('apigatewayv2'),
        'iam': session.client('iam'),
        'cloudformation': session.client('cloudformation')
    }

def create_s3_bucket(s3_client, bucket_name):
    """Crear bucket S3 si no existe"""
    try:
        s3_client.head_bucket(Bucket=bucket_name)
        print(f"✅ Bucket {bucket_name} ya existe")
        return True
    except:
        try:
            s3_client.create_bucket(Bucket=bucket_name)
            print(f"✅ Bucket {bucket_name} creado")
            return True
        except Exception as e:
            print(f"❌ Error creando bucket: {e}")
            return False

def create_lambda_zip():
    """Crear ZIP con función Lambda"""
    with zipfile.ZipFile('lambda-deployment.zip', 'w') as zip_file:
        zip_file.write('lambda_function.py')
    print("✅ ZIP de Lambda creado")

def create_iam_role(iam_client):
    """Crear rol IAM para Lambda"""
    role_name = "ocr-lambda-role"
    
    # Policy document para asumir rol
    assume_role_policy = {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Principal": {"Service": "lambda.amazonaws.com"},
                "Action": "sts:AssumeRole"
            }
        ]
    }
    
    # Policy para permisos de Lambda
    lambda_policy = {
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
                    "s3:PutObject"
                ],
                "Resource": "arn:aws:s3:::ocr-escaner-word/*"
            }
        ]
    }
    
    try:
        # Crear rol
        role_response = iam_client.create_role(
            RoleName=role_name,
            AssumeRolePolicyDocument=json.dumps(assume_role_policy)
        )
        
        # Crear y adjuntar policy
        iam_client.put_role_policy(
            RoleName=role_name,
            PolicyName="OCRLambdaPolicy",
            PolicyDocument=json.dumps(lambda_policy)
        )
        
        print(f"✅ Rol IAM {role_name} creado")
        return role_response['Role']['Arn']
        
    except iam_client.exceptions.EntityAlreadyExistsException:
        # El rol ya existe
        role_response = iam_client.get_role(RoleName=role_name)
        print(f"✅ Rol IAM {role_name} ya existe")
        return role_response['Role']['Arn']
    except Exception as e:
        print(f"❌ Error creando rol IAM: {e}")
        return None

def create_lambda_function(lambda_client, role_arn):
    """Crear función Lambda"""
    function_name = "ocr-textract-processor"
    
    # Leer ZIP file
    with open('lambda-deployment.zip', 'rb') as zip_file:
        zip_content = zip_file.read()
    
    try:
        response = lambda_client.create_function(
            FunctionName=function_name,
            Runtime='python3.9',
            Role=role_arn,
            Handler='lambda_function.lambda_handler',
            Code={'ZipFile': zip_content},
            Environment={
                'Variables': {
                    'BUCKET_NAME': 'ocr-escaner-word'
                }
            },
            Timeout=60
        )
        print(f"✅ Función Lambda {function_name} creada")
        return response['FunctionArn']
        
    except lambda_client.exceptions.ResourceConflictException:
        # La función ya existe, actualizar código
        lambda_client.update_function_code(
            FunctionName=function_name,
            ZipFile=zip_content
        )
        response = lambda_client.get_function(FunctionName=function_name)
        print(f"✅ Función Lambda {function_name} actualizada")
        return response['Configuration']['FunctionArn']
    except Exception as e:
        print(f"❌ Error creando función Lambda: {e}")
        return None

def create_api_gateway(apigateway_client, lambda_arn):
    """Crear API Gateway"""
    api_name = "ocr-api"
    
    try:
        # Crear API
        api_response = apigateway_client.create_api(
            Name=api_name,
            ProtocolType='HTTP',
            CorsConfiguration={
                'AllowOrigins': ['*'],
                'AllowHeaders': ['Content-Type', 'Authorization', 'X-Requested-With'],
                'AllowMethods': ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
                'MaxAge': 86400
            }
        )
        
        api_id = api_response['ApiId']
        print(f"✅ API Gateway {api_name} creado: {api_id}")
        
        # Crear integración
        integration_response = apigateway_client.create_integration(
            ApiId=api_id,
            IntegrationType='AWS_PROXY',
            IntegrationUri=f"arn:aws:apigateway:{region}:lambda:path/2015-03-31/functions/{lambda_arn}/invocations",
            PayloadFormatVersion='2.0'
        )
        
        integration_id = integration_response['IntegrationId']
        print(f"✅ Integración creada: {integration_id}")
        
        # Crear rutas
        apigateway_client.create_route(
            ApiId=api_id,
            RouteKey='POST /',
            Target=f"integrations/{integration_id}"
        )
        
        apigateway_client.create_route(
            ApiId=api_id,
            RouteKey='OPTIONS /',
            Target=f"integrations/{integration_id}"
        )
        
        # Crear stage
        apigateway_client.create_stage(
            ApiId=api_id,
            StageName='prod',
            AutoDeploy=True
        )
        
        print("✅ Rutas y stage creados")
        
        # URL del API
        api_url = f"https://{api_id}.execute-api.{region}.amazonaws.com/prod"
        return api_url
        
    except Exception as e:
        print(f"❌ Error creando API Gateway: {e}")
        return None

def add_lambda_permission(lambda_client, api_id):
    """Agregar permisos para que API Gateway invoque Lambda"""
    function_name = "ocr-textract-processor"
    
    try:
        lambda_client.add_permission(
            FunctionName=function_name,
            StatementId='api-gateway-invoke',
            Action='lambda:InvokeFunction',
            Principal='apigateway.amazonaws.com',
            SourceArn=f"arn:aws:execute-api:{region}:736638864413:{api_id}/*/*"
        )
        print("✅ Permisos de Lambda configurados")
    except Exception as e:
        if "ResourceConflictException" in str(e):
            print("✅ Permisos de Lambda ya existen")
        else:
            print(f"⚠️ Error configurando permisos: {e}")

def main():
    print("🚀 Iniciando despliegue de infraestructura OCR...")
    
    # Crear clientes
    clients = create_aws_clients()
    
    # 1. Crear bucket S3
    if not create_s3_bucket(clients['s3'], 'ocr-escaner-word'):
        return
    
    # 2. Crear ZIP de Lambda
    create_lambda_zip()
    
    # 3. Crear rol IAM
    role_arn = create_iam_role(clients['iam'])
    if not role_arn:
        return
    
    # Esperar a que el rol se propague
    print("⏳ Esperando propagación del rol IAM...")
    time.sleep(10)
    
    # 4. Crear función Lambda
    lambda_arn = create_lambda_function(clients['lambda'], role_arn)
    if not lambda_arn:
        return
    
    # 5. Crear API Gateway
    api_url = create_api_gateway(clients['apigateway'], lambda_arn)
    if not api_url:
        return
    
    # 6. Configurar permisos
    api_id = api_url.split('.')[0].replace('https://', '')
    add_lambda_permission(clients['lambda'], api_id)
    
    print("\n🎉 ¡Despliegue completado exitosamente!")
    print(f"📡 URL del API: {api_url}")
    print(f"📝 Actualiza tu .env con: EXPO_PUBLIC_AWS_API_URL={api_url}")
    
    # Actualizar archivo .env
    try:
        env_path = "../.env"
        with open(env_path, 'r') as f:
            env_content = f.read()
        
        # Reemplazar URL
        new_env_content = env_content.replace(
            "EXPO_PUBLIC_AWS_API_URL=https://w4z95g8ig9.execute-api.us-east-1.amazonaws.com/prod",
            f"EXPO_PUBLIC_AWS_API_URL={api_url}"
        )
        
        with open(env_path, 'w') as f:
            f.write(new_env_content)
        
        print(f"✅ Archivo .env actualizado automáticamente")
        
    except Exception as e:
        print(f"⚠️ No se pudo actualizar .env automáticamente: {e}")

if __name__ == "__main__":
    main()
