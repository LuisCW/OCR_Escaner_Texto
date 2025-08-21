import requests
import base64
import json

# URL del endpoint
url = "https://mjytdfx1j9.execute-api.us-east-1.amazonaws.com/"

# Imagen de prueba muy pequeña (1x1 pixel PNG)
test_image_base64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU7TygAAAABJRU5ErkJggg=="

# Datos de la petición
data = {
    "test": True
}

# Headers
headers = {
    "Content-Type": "application/json",
    "Origin": "exp://192.168.1.1:8082"
}

print("🧪 Probando endpoint AWS...")
print(f"URL: {url}")

try:
    # Hacer petición POST
    response = requests.post(url, json=data, headers=headers, timeout=30)
    
    print(f"Status: {response.status_code}")
    print(f"Headers: {dict(response.headers)}")
    
    if response.status_code == 200:
        result = response.json()
        print("✅ ¡Endpoint funcionando correctamente!")
        print(f"Respuesta: {json.dumps(result, indent=2, ensure_ascii=False)}")
    else:
        print(f"❌ Error: {response.status_code}")
        print(f"Respuesta: {response.text}")
        
except requests.exceptions.Timeout:
    print("⏰ Timeout - La petición tardó más de 30 segundos")
except requests.exceptions.RequestException as e:
    print(f"❌ Error de conexión: {e}")
except Exception as e:
    print(f"❌ Error inesperado: {e}")
