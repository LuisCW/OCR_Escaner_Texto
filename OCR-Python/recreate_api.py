import boto3
import json
import time

# Configurar credenciales
aws_access_key_id = "AKIA2XAYZBQOXZAHVZOS"
aws_secret_access_key = "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"
region = "us-east-1"

def recreate_api():
    """Recrear API desde cero con configuración correcta"""
    session = boto3.Session(
        aws_access_key_id=aws_access_key_id,
        aws_secret_access_key=aws_secret_access_key,
        region_name=region
    )
    
    apigateway = session.client('apigatewayv2')
    lambda_client = session.client('lambda')
    
    try:
        # Eliminar API anterior si existe
        try:
            apis = apigateway.get_apis()
            for api in apis['Items']:
                if 'ocr' in api['Name'].lower():
                    print(f"🗑️ Eliminando API anterior: {api['ApiId']}")
                    apigateway.delete_api(ApiId=api['ApiId'])
        except Exception as e:
            print(f"Info: {e}")
        
        # Crear nueva API
        api_response = apigateway.create_api(
            Name='ocr-api-v2',
            ProtocolType='HTTP',
            CorsConfiguration={
                'AllowCredentials': False,
                'AllowOrigins': ['*'],
                'AllowHeaders': ['*'],
                'AllowMethods': ['*'],
                'MaxAge': 86400
            }
        )
        
        api_id = api_response['ApiId']
        print(f"✅ Nueva API creada: {api_id}")
        
        # Crear integración directa con Lambda
        lambda_arn = "arn:aws:lambda:us-east-1:736638864413:function:ocr-textract-processor"
        
        integration_response = apigateway.create_integration(
            ApiId=api_id,
            IntegrationType='AWS_PROXY',
            IntegrationUri=lambda_arn,
            PayloadFormatVersion='2.0'
        )
        
        integration_id = integration_response['IntegrationId']
        print(f"✅ Integración creada: {integration_id}")
        
        # Crear ruta catch-all
        route_response = apigateway.create_route(
            ApiId=api_id,
            RouteKey='$default',
            Target=f"integrations/{integration_id}"
        )
        print(f"✅ Ruta $default creada")
        
        # Crear stage
        stage_response = apigateway.create_stage(
            ApiId=api_id,
            StageName='$default',
            AutoDeploy=True
        )
        print(f"✅ Stage creado")
        
        # Agregar permisos de Lambda
        try:
            lambda_client.add_permission(
                FunctionName='ocr-textract-processor',
                StatementId=f'api-gateway-invoke-{int(time.time())}',
                Action='lambda:InvokeFunction',
                Principal='apigateway.amazonaws.com',
                SourceArn=f"arn:aws:execute-api:{region}:736638864413:{api_id}/*/*"
            )
            print("✅ Permisos de Lambda configurados")
        except Exception as e:
            print(f"Info permisos: {e}")
        
        # URL del API
        api_url = f"https://{api_id}.execute-api.{region}.amazonaws.com/"
        
        print(f"\n🎉 Nueva API configurada:")
        print(f"📡 URL: {api_url}")
        
        return api_url
        
    except Exception as e:
        print(f"❌ Error recreando API: {e}")
        return None

def update_env_file(new_url):
    """Actualizar archivo .env con nueva URL"""
    try:
        env_path = "../.env"
        with open(env_path, 'r') as f:
            env_content = f.read()
        
        # Reemplazar URL
        lines = env_content.split('\n')
        for i, line in enumerate(lines):
            if line.startswith('EXPO_PUBLIC_AWS_API_URL='):
                lines[i] = f'EXPO_PUBLIC_AWS_API_URL={new_url}'
                break
        
        with open(env_path, 'w') as f:
            f.write('\n'.join(lines))
        
        print(f"✅ Archivo .env actualizado con: {new_url}")
        
    except Exception as e:
        print(f"⚠️ Error actualizando .env: {e}")

def main():
    print("🔄 Recreando API Gateway con configuración correcta...")
    
    new_url = recreate_api()
    if new_url:
        update_env_file(new_url)
        print(f"\n🧪 Prueba el nuevo endpoint:")
        print(f"curl -X POST {new_url} -H 'Content-Type: application/json' -d '{{\"test\": true}}'")
    else:
        print("\n❌ Error recreando API")

if __name__ == "__main__":
    main()
