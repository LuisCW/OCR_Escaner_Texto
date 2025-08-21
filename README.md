# 📱 OCR Scanner Word - Escáner de Documentos con OCR

<div align="center">
  <img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white" />
  <img src="https://img.shields.io/badge/AWS_Textract-FF9900?style=for-the-badge&logo=amazon-aws&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" />
</div>

## 🚀 Descripción

**OCR Scanner Word** es una aplicación móvil avanzada que convierte imágenes de documentos en texto editable utilizando tecnología de OCR (Reconocimiento Óptico de Caracteres) powered by AWS Textract. La aplicación permite capturar fotos de documentos con la cámara del dispositivo y extraer el texto automáticamente con alta precisión.

### ✨ Características Principales

- 📸 **Captura de documentos** con cámara nativa optimizada
- 🔍 **OCR de alta precisión** usando AWS Textract
- 📄 **Exportación a Word** con formato preservado
- 🌐 **Procesamiento en la nube** para mejor rendimiento
- 📱 **Interfaz nativa** para Android e iOS
- 🔧 **Sin configuración compleja** - Listo para usar

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React Native** 0.79.5 con Expo SDK 53
- **TypeScript** para mayor robustez del código
- **Expo Router** para navegación
- **Expo Camera** para captura optimizada
- **React Native Gesture Handler** para interacciones

### Backend
- **AWS Lambda** - Función serverless para procesamiento
- **AWS Textract** - Servicio de OCR de alta precisión
- **AWS API Gateway** - API REST para comunicación
- **AWS S3** - Almacenamiento temporal de imágenes

### Herramientas de Desarrollo
- **Expo CLI** para desarrollo y build
- **EAS Build** para generación de APK/IPA
- **ESLint** para calidad de código
- **Git** para control de versiones

## 🏗️ Arquitectura

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React Native  │───▶│   AWS Gateway    │───▶│   AWS Lambda    │
│   (Frontend)    │    │   (API REST)     │    │   (Processor)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                         │
                                                         ▼
                                               ┌─────────────────┐
                                               │  AWS Textract   │
                                               │   (OCR Engine)  │
                                               └─────────────────┘
```

## 🚀 Instalación y Configuración

### Requisitos Previos
- Node.js 18+ 
- npm o yarn
- Expo CLI
- Android Studio (para Android)
- Xcode (para iOS)

### 1. Clonar el Repositorio
```bash
git clone https://github.com/LuisCW/Escaner-Word-OCR.git
cd Escaner-Word-OCR
```

### 2. Instalar Dependencias
```bash
npm install --legacy-peer-deps
```

### 3. Configurar Variables de Entorno
Crear archivo `.env` en la raíz:
```env
EXPO_PUBLIC_AWS_API_URL=https://tu-api-gateway-url.amazonaws.com/
EXPO_PUBLIC_USE_LOCAL_SERVER=false
EXPO_PUBLIC_APP_NAME=OCR Scanner Word
EXPO_PUBLIC_APP_VERSION=2.0.0
```

### 4. Iniciar el Proyecto
```bash
# Desarrollo
npx expo start

# Para Android
npx expo run:android

# Para iOS  
npx expo run:ios
```

## 📱 Generar APK/IPA

### Android APK
```bash
# Prebuild para Android
npx expo prebuild --platform android

# Generar APK de release
cd android && ./gradlew assembleRelease
```

### iOS (requiere macOS)
```bash
# Prebuild para iOS
npx expo prebuild --platform ios

# Abrir en Xcode para build
npx expo run:ios --configuration Release
```

## 🔧 Configuración AWS

### Backend Serverless
El proyecto incluye la infraestructura AWS completa:

1. **Lambda Function** (`OCR-Python/lambda_function.py`)
2. **CloudFormation Template** (`OCR-Python/cloudformation-template.json`)
3. **Scripts de Deployment** (`OCR-Python/deploy_boto3.py`)

### Desplegar Backend
```bash
cd OCR-Python
python deploy_boto3.py
```

## 📋 Scripts Disponibles

```json
{
  "start": "expo start",
  "android": "expo run:android", 
  "ios": "expo run:ios",
  "web": "expo start --web",
  "lint": "expo lint"
}
```

## 🎯 Uso de la Aplicación

1. **Abrir la aplicación** en tu dispositivo
2. **Permitir permisos** de cámara y almacenamiento
3. **Capturar documento** usando el botón de cámara
4. **Procesar OCR** automáticamente
5. **Revisar y editar** el texto extraído
6. **Exportar** a Word o compartir

## 🔐 Seguridad y Privacidad

- ✅ **No almacenamiento permanente** - Las imágenes se procesan y eliminan
- ✅ **Conexión HTTPS** - Comunicación encriptada con AWS
- ✅ **Permisos mínimos** - Solo cámara y almacenamiento necesarios
- ✅ **Código abierto** - Transparencia total del funcionamiento

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/NuevaCaracteristica`)
3. Commit tus cambios (`git commit -m 'Añadir nueva característica'`)
4. Push a la rama (`git push origin feature/NuevaCaracteristica`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 👨‍💻 Autor

**Luis CW** - [GitHub](https://github.com/LuisCW)

## 🙏 Agradecimientos

- AWS Textract por la tecnología OCR
- Expo team por el excelente framework
- React Native community por las librerías

---

<div align="center">
  <p>⭐ ¡Dale una estrella si te gustó el proyecto! ⭐</p>
</div>
