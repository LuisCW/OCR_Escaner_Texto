import json
import boto3
import base64
from io import BytesIO
import uuid
import logging

# Configurar logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event, context):
    """
    Función Lambda para procesar imágenes con AWS Textract
    """
    
    # Headers CORS para todas las respuestas
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Requested-With',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,PUT,DELETE',
        'Access-Control-Max-Age': '86400'
    }
    
    try:
        # Log del evento para debug
        logger.info(f"Event received: {json.dumps(event)}")
        
        # Manejar preflight OPTIONS request
        http_method = event.get('requestContext', {}).get('http', {}).get('method')
        if not http_method:
            http_method = event.get('httpMethod', 'POST')
        
        if http_method == 'OPTIONS':
            return {
                'statusCode': 200,
                'headers': cors_headers,
                'body': json.dumps({'message': 'CORS preflight successful'})
            }
        
        # Parsear el body de la request
        body_content = event.get('body', '{}')
        if event.get('isBase64Encoded', False):
            body_content = base64.b64decode(body_content).decode('utf-8')
        
        try:
            request_data = json.loads(body_content)
        except json.JSONDecodeError:
            logger.error(f"Invalid JSON in body: {body_content}")
            return {
                'statusCode': 400,
                'headers': cors_headers,
                'body': json.dumps({
                    'error': 'Invalid JSON',
                    'message': 'El cuerpo de la petición debe ser JSON válido'
                })
            }
        
        logger.info(f"Request data keys: {list(request_data.keys())}")
        
        # Si es solo una prueba, devolver respuesta simple
        if request_data.get('test'):
            return {
                'statusCode': 200,
                'headers': cors_headers,
                'body': json.dumps({
                    'text': 'Texto de prueba extraído exitosamente',
                    'metadata': {
                        'processing_method': 'AWS Textract',
                        'confidence': 95.5,
                        'character_count': 35,
                        'line_count': 1,
                        'processing_type': 'test_mode'
                    },
                    'status': 'success'
                })
            }
        
        # Extraer imagen base64
        image_data = request_data.get('image', '')
        title = request_data.get('title', f'documento_ocr_{uuid.uuid4().hex[:8]}')
        
        if not image_data:
            return {
                'statusCode': 400,
                'headers': cors_headers,
                'body': json.dumps({
                    'error': 'No se proporcionó imagen',
                    'message': 'El campo "image" es requerido'
                })
            }
        
        # Procesar imagen base64
        if image_data.startswith('data:image/'):
            # Remover el prefijo data:image/...;base64,
            image_data = image_data.split(',')[1]
        
        # Decodificar imagen
        try:
            image_bytes = base64.b64decode(image_data)
            logger.info(f"Imagen decodificada: {len(image_bytes)} bytes")
        except Exception as e:
            logger.error(f"Error decodificando imagen: {str(e)}")
            return {
                'statusCode': 400,
                'headers': cors_headers,
                'body': json.dumps({
                    'error': 'Error decodificando imagen',
                    'message': str(e)
                })
            }
        
        # Usar Textract directamente con bytes (sin S3)
        textract = boto3.client('textract', region_name='us-east-1')
        
        try:
            response = textract.detect_document_text(
                Document={
                    'Bytes': image_bytes
                }
            )
            logger.info("Textract procesado exitosamente")
        except Exception as e:
            logger.error(f"Error en Textract: {str(e)}")
            return {
                'statusCode': 500,
                'headers': cors_headers,
                'body': json.dumps({
                    'error': 'Error procesando con Textract',
                    'message': str(e)
                })
            }
        
        # Extraer texto
        extracted_text = ""
        confidence_scores = []
        
        for block in response['Blocks']:
            if block['BlockType'] == 'LINE':
                extracted_text += block['Text'] + '\n'
                if 'Confidence' in block:
                    confidence_scores.append(block['Confidence'])
        
        # Calcular confianza promedio
        avg_confidence = sum(confidence_scores) / len(confidence_scores) if confidence_scores else 0
        
        # Si no se extrajo texto, devolver mensaje
        if not extracted_text.strip():
            extracted_text = "No se pudo extraer texto de la imagen. Asegúrate de que la imagen contenga texto legible."
            avg_confidence = 0
        
        # Crear resultado
        result = {
            'text': extracted_text.strip(),
            'metadata': {
                'processing_method': 'AWS Textract',
                'confidence': round(avg_confidence, 2),
                'character_count': len(extracted_text.strip()),
                'line_count': len(extracted_text.strip().split('\n')),
                'processing_type': 'document_text_detection'
            },
            'status': 'success'
        }
        
        logger.info(f"Procesamiento completado: {len(extracted_text)} caracteres extraídos")
        
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': json.dumps(result, ensure_ascii=False)
        }
        
    except Exception as e:
        logger.error(f"Error general: {str(e)}")
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({
                'error': 'Error interno del servidor',
                'message': str(e)
            })
        }
