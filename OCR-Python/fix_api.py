import boto3
import json

# Configurar credenciales
aws_access_key_id = "AKIA2XAYZBQOXZAHVZOS"
aws_secret_access_key = "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"
region = "us-east-1"

def check_api_configuration():
    """Verificar configuración del API Gateway"""
    session = boto3.Session(
        aws_access_key_id=aws_access_key_id,
        aws_secret_access_key=aws_secret_access_key,
        region_name=region
    )
    
    apigateway = session.client('apigatewayv2')
    
    try:
        # Listar APIs
        apis = apigateway.get_apis()
        print("APIs disponibles:")
        for api in apis['Items']:
            if 'ocr' in api['Name'].lower():
                api_id = api['ApiId']
                print(f"  - {api['Name']} (ID: {api_id})")
                
                # Listar rutas
                routes = apigateway.get_routes(ApiId=api_id)
                print("  Rutas configuradas:")
                for route in routes['Items']:
                    print(f"    - {route['RouteKey']}")
                
                # Verificar integración
                integrations = apigateway.get_integrations(ApiId=api_id)
                print("  Integraciones:")
                for integration in integrations['Items']:
                    print(f"    - {integration.get('IntegrationType', 'N/A')} -> {integration.get('IntegrationUri', 'N/A')}")
                
                return api_id
        
    except Exception as e:
        print(f"Error verificando configuración: {e}")
        return None

def fix_api_routes(api_id):
    """Corregir rutas del API"""
    session = boto3.Session(
        aws_access_key_id=aws_access_key_id,
        aws_secret_access_key=aws_secret_access_key,
        region_name=region
    )
    
    apigateway = session.client('apigatewayv2')
    
    try:
        # Obtener integraciones
        integrations = apigateway.get_integrations(ApiId=api_id)
        if not integrations['Items']:
            print("❌ No hay integraciones configuradas")
            return False
        
        integration_id = integrations['Items'][0]['IntegrationId']
        
        # Crear ruta ANY para capturar todas las peticiones
        try:
            apigateway.create_route(
                ApiId=api_id,
                RouteKey='ANY /{proxy+}',
                Target=f"integrations/{integration_id}"
            )
            print("✅ Ruta ANY /{proxy+} creada")
        except Exception as e:
            if "ConflictException" in str(e):
                print("✅ Ruta ANY /{proxy+} ya existe")
            else:
                print(f"Error creando ruta: {e}")
        
        # Crear ruta raíz
        try:
            apigateway.create_route(
                ApiId=api_id,
                RouteKey='ANY /',
                Target=f"integrations/{integration_id}"
            )
            print("✅ Ruta ANY / creada")
        except Exception as e:
            if "ConflictException" in str(e):
                print("✅ Ruta ANY / ya existe")
            else:
                print(f"Error creando ruta raíz: {e}")
        
        return True
        
    except Exception as e:
        print(f"Error corrigiendo rutas: {e}")
        return False

def main():
    print("🔍 Verificando configuración del API Gateway...")
    
    api_id = check_api_configuration()
    if api_id:
        print(f"\n🔧 Corrigiendo rutas para API {api_id}...")
        if fix_api_routes(api_id):
            print(f"\n✅ Configuración corregida")
            print(f"🧪 Prueba ahora: https://{api_id}.execute-api.{region}.amazonaws.com/prod")
        else:
            print("\n❌ Error corrigiendo configuración")
    else:
        print("\n❌ No se encontró API OCR")

if __name__ == "__main__":
    main()
