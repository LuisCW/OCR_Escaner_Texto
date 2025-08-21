# OCR API Backend

Este es el backend de la aplicación de OCR que convierte texto manuscrito a documentos Word.

## Características

- **OCR avanzado** usando EasyOCR para texto manuscrito
- **Preprocesamiento de imágenes** para mejorar la precisión
- **Generación de documentos Word** automática
- **API REST** con FastAPI
- **Soporte multiidioma** (Español e Inglés)

## Instalación

1. Instalar dependencias:
```bash
pip install -r requirements.txt
```

2. Ejecutar el servidor:
```bash
python main.py
```

El servidor estará disponible en `http://localhost:8000`

## Endpoints

### GET /
Verificar que la API está funcionando

### POST /extract-text/
Extrae texto de una imagen
- **Input**: Archivo de imagen (multipart/form-data)
- **Output**: Texto extraído con puntuaciones de confianza

### POST /create-word-document/
Crea un documento Word a partir de texto
- **Input**: Texto y título opcional
- **Output**: Información del documento creado

### POST /process-image-to-word/
Proceso completo: imagen → texto → documento Word
- **Input**: Archivo de imagen y título opcional
- **Output**: Texto extraído + documento Word

### GET /download/{filename}
Descarga un documento Word generado

## Tecnologías utilizadas

- **FastAPI**: Framework web moderno y rápido
- **EasyOCR**: Biblioteca OCR optimizada para texto manuscrito
- **OpenCV**: Procesamiento de imágenes
- **python-docx**: Generación de documentos Word
- **Pillow**: Manipulación de imágenes

## Configuración

El servidor está configurado para aceptar conexiones desde cualquier origen (CORS habilitado) para desarrollo. En producción, configurar dominios específicos.
