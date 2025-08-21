import DocumentPreview from '@/components/DocumentPreview';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system';
import { Image } from 'expo-image';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  BackHandler,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

interface OCRResult {
  text: string;
  metadata: {
    processing_method: string;
    confidence: number;
    character_count: number;
    line_count?: number;
    processing_type: string;
  };
  download_url?: string;
  status: string;
}

interface CameraScreenProps {
  onBack?: () => void;
  scanMode?: 'quick' | 'document';
  externalImageUri?: string;
}

export default function CameraScreen({ onBack, scanMode = 'quick', externalImageUri }: CameraScreenProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [progressMessage, setProgressMessage] = useState<string>('');
  const [editableText, setEditableText] = useState<string>('');
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showPreview, setShowPreview] = useState<boolean>(false);

  // Configuración de la URL de la API
  const getApiBaseUrl = () => {
    const AWS_API_URL = process.env.EXPO_PUBLIC_AWS_API_URL || 'https://w4z95g8ig9.execute-api.us-east-1.amazonaws.com/prod';
    const USE_LOCAL = process.env.EXPO_PUBLIC_USE_LOCAL_SERVER === 'true';
    console.log('[ENV] EXPO_PUBLIC_AWS_API_URL:', process.env.EXPO_PUBLIC_AWS_API_URL);
    console.log('[ENV] EXPO_PUBLIC_USE_LOCAL_SERVER:', process.env.EXPO_PUBLIC_USE_LOCAL_SERVER);
    if (__DEV__) {
      return USE_LOCAL ? 'http://192.168.20.131:8900' : AWS_API_URL;
    }
    return AWS_API_URL;
  };

  const API_BASE_URL = getApiBaseUrl();
  if (!API_BASE_URL) {
    Alert.alert('Error', 'La variable EXPO_PUBLIC_AWS_API_URL no está definida.');
    throw new Error('EXPO_PUBLIC_AWS_API_URL no está definida');
  }

  useEffect(() => {
    const backAction = () => {
      if (onBack) {
        onBack();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [onBack]);

  useEffect(() => {
    if (externalImageUri) {
      setCapturedImage(externalImageUri);
    }
  }, [externalImageUri]);

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
        });
        if (photo) {
          setCapturedImage(photo.uri);
        }
      } catch {
        Alert.alert('Error', 'No se pudo tomar la foto');
      }
    }
  };

  const processImage = async () => {
    if (!capturedImage) {
      Alert.alert('Error', 'No hay imagen para procesar');
      return;
    }

    setIsProcessing(true);
    setProgress(5);
    setProgressMessage('🚀 Iniciando procesamiento...');
    
    try {
      const fileInfo = await FileSystem.getInfoAsync(capturedImage);
      if (!fileInfo.exists) {
        throw new Error('La imagen no se encuentra disponible');
      }

      const progressSteps = [
        { progress: 15, message: '🔄 Preparando imagen...' },
        { progress: 30, message: '📡 Enviando al servidor AWS...' },
        { progress: 50, message: '🔍 Procesando con Textract...' },
        { progress: 70, message: '📝 Extrayendo texto...' },
        { progress: 85, message: '📋 Organizando contenido...' },
        { progress: 95, message: '💾 Finalizando...' }
      ];

      let currentStep = 0;
      const progressInterval = setInterval(() => {
        if (currentStep < progressSteps.length) {
          setProgress(progressSteps[currentStep].progress);
          setProgressMessage(progressSteps[currentStep].message);
          currentStep++;
        }
      }, 800);

      // Convertir imagen a base64
      const base64Image = await FileSystem.readAsStringAsync(capturedImage, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const requestData = {
        image: `data:image/jpeg;base64,${base64Image}`,
        title: `Documento OCR - ${new Date().toLocaleDateString()}`
      };

      console.log('🚀 Enviando imagen a AWS Lambda:', API_BASE_URL);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      console.log('[API] URL:', API_BASE_URL);
      console.log('[API] RequestData:', requestData);
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        mode: 'cors',
        body: JSON.stringify(requestData),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': 'exp://192.168.1.1:8081'
        },
        signal: controller.signal
      });
      console.log('[API] Response status:', response.status);

      clearTimeout(timeoutId);
      clearInterval(progressInterval);
      setProgress(100);
      setProgressMessage('¡Completado!');

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error del servidor:', response.status, errorText);
        if (response.status === 403 || response.status === 401) {
          throw new Error('Error de autenticación o CORS. Verifica los permisos y configuración de CORS en AWS API Gateway.');
        }
        throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
      }

      const result: OCRResult = await response.json();
      console.log('✅ OCR Result:', result);
      
      setExtractedText(result.text);
      setEditableText(result.text);
      setOcrResult(result);
      setShowPreview(true);

    } catch (err) {
      console.error('Error procesando imagen:', err);
      let errorMessage = 'No se pudo procesar la imagen';
      
      if (err instanceof TypeError && err.message.includes('Network request failed')) {
        errorMessage = `Error de conexión. Verifica que el servidor esté ejecutándose en ${API_BASE_URL}`;
      } else if (err instanceof Error) {
        errorMessage = `Error: ${err.message}`;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsProcessing(false);
      setProgress(0);
      setProgressMessage('');
    }
  };

  const downloadFile = async () => {
    try {
      if (ocrResult?.download_url) {
        console.log('🔽 Descargando desde AWS S3:', ocrResult.download_url);
        
        const timestamp = new Date().getTime();
        const localFilename = `documento_ocr_${timestamp}.docx`;
        const localFileUri = FileSystem.documentDirectory + localFilename;
        
        Alert.alert('Descargando...', 'Descargando documento desde AWS...');
        
        const downloadResult = await FileSystem.downloadAsync(ocrResult.download_url, localFileUri);
        
        if (downloadResult.status === 200) {
          const fileInfo = await FileSystem.getInfoAsync(localFileUri);
          
          if (fileInfo.exists && fileInfo.size && fileInfo.size > 0) {
            console.log('✅ Archivo descargado:', fileInfo.size, 'bytes');
            
            const isAvailable = await Sharing.isAvailableAsync();
            if (isAvailable) {
              await Sharing.shareAsync(localFileUri, {
                mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                dialogTitle: 'Compartir documento Word'
              });
              Alert.alert('¡Éxito!', 'Documento descargado y listo para compartir.');
            } else {
              Alert.alert('Descarga completa', `Archivo guardado en: ${localFilename}`);
            }
          } else {
            throw new Error('Archivo descargado está vacío');
          }
        } else {
          throw new Error(`Error de descarga: ${downloadResult.status}`);
        }
      } else {
        if (!extractedText || extractedText.trim() === '') {
          Alert.alert('Error', 'No hay texto para crear el documento.');
          return;
        }
        
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Documento OCR</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        h1 { color: #333; text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; }
        .content { margin-top: 30px; text-align: justify; }
        .footer { margin-top: 50px; text-align: center; color: #666; font-size: 0.9em; }
    </style>
</head>
<body>
    <h1>Documento OCR - Scanner Word</h1>
    <div class="content">
        ${extractedText.replace(/\n/g, '<br>')}
    </div>
    <div class="footer">
        <p>Generado por OCR Scanner Word - ${new Date().toLocaleDateString()}</p>
        <p>Procesado con ${ocrResult?.metadata?.processing_method || 'OCR Engine'}</p>
    </div>
</body>
</html>`;
        
        const timestamp = new Date().getTime();
        const filename = `documento_ocr_${timestamp}.html`;
        const fileUri = FileSystem.documentDirectory + filename;
        
        await FileSystem.writeAsStringAsync(fileUri, htmlContent, {
          encoding: FileSystem.EncodingType.UTF8,
        });
        
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'text/html',
            dialogTitle: 'Compartir documento'
          });
          Alert.alert('¡Éxito!', 'Documento HTML creado y listo para compartir.');
        } else {
          Alert.alert('Documento creado', `Archivo guardado como: ${filename}`);
        }
      }
      
    } catch (error) {
      console.error('❌ Error descargando/creando archivo:', error);
      
      let errorMessage = 'Error al procesar el documento.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
    }
  };

  const resetCapture = () => {
    setCapturedImage(null);
    setExtractedText('');
    setOcrResult(null);
    setShowPreview(false);
    setEditableText('');
    setShowEditModal(false);
  };

  const copyTextToClipboard = async () => {
    try {
      if (extractedText.trim()) {
        await Clipboard.setStringAsync(extractedText);
        Alert.alert('✅ Copiado', 'Texto copiado al portapapeles exitosamente');
      } else {
        Alert.alert('⚠️ Sin texto', 'No hay texto para copiar');
      }
    } catch (error) {
      console.error('Error copiando texto:', error);
      Alert.alert('❌ Error', 'No se pudo copiar el texto');
    }
  };

  const openEditModal = () => {
    setEditableText(extractedText);
    setShowEditModal(true);
  };

  const saveEditedText = () => {
    setExtractedText(editableText);
    setShowEditModal(false);
    Alert.alert('✅ Guardado', 'Texto editado guardado correctamente');
  };

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.message}>Necesitamos acceso a la cámara</ThemedText>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Conceder permisos</Text>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  if (showPreview && extractedText) {
    return (
      <DocumentPreview
        visible={showPreview}
        onClose={() => setShowPreview(false)}
        title={`Documento OCR - ${new Date().toLocaleDateString()}`}
        text={extractedText}
        onDownload={downloadFile}
      />
    );
  }

  return (
    <ThemedView style={styles.container}>
      {capturedImage ? (
        <ScrollView style={styles.previewContainer}>
          <Image source={{ uri: capturedImage }} style={styles.capturedImage} />
          
          {isProcessing && (
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>{progressMessage}</Text>
              
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBackground}>
                  <View 
                    style={[
                      styles.progressBarFill,
                      { width: `${progress}%` }
                    ]} 
                  />
                </View>
              </View>
              <Text style={styles.progressPercentage}>📊 {progress}%</Text>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.processButton, isProcessing && styles.processingButton]}
              onPress={processImage}
              disabled={isProcessing}
            >
              <Text style={styles.processButtonText}>
                {isProcessing ? '⏳ Procesando...' : '🔍 Procesar con OCR'}
              </Text>
            </TouchableOpacity>

            {extractedText && !isProcessing && (
              <View style={styles.resultContainer}>
                <Text style={styles.resultTitle}>✅ Texto extraído:</Text>
                <ScrollView style={styles.textContainer}>
                  <Text style={styles.extractedText}>{extractedText}</Text>
                </ScrollView>

                <View style={styles.actionButtons}>
                  <TouchableOpacity style={styles.copyButton} onPress={copyTextToClipboard}>
                    <Text style={styles.copyButtonText}>📋 Copiar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.editButton} onPress={openEditModal}>
                    <Text style={styles.editButtonText}>✏️ Editar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.downloadButton} onPress={downloadFile}>
                    <Text style={styles.downloadButtonText}>📄 Descargar</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.previewButton} onPress={() => setShowPreview(true)}>
                  <Text style={styles.previewButtonText}>👁️ Ver Preview</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity style={styles.retakeButton} onPress={resetCapture}>
              <Text style={styles.retakeButtonText}>🔄 Nueva foto</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.cameraContainer}>
          <CameraView style={styles.camera} ref={cameraRef} facing="back">
            <View style={styles.cameraOverlay}>
              <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>
            </View>
          </CameraView>
        </View>
      )}

      {/* Modal de edición */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>✏️ Editar Texto</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowEditModal(false)}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.modalTextInput}
            value={editableText}
            onChangeText={setEditableText}
            multiline
            placeholder="Edita el texto aquí..."
            textAlignVertical="top"
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowEditModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalSaveButton}
              onPress={saveEditedText}
            >
              <Text style={styles.modalSaveText}>💾 Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 50,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  previewContainer: {
    flex: 1,
    padding: 20,
  },
  capturedImage: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    marginBottom: 20,
  },
  progressContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  progressText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  progressBarContainer: {
    marginBottom: 10,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  progressPercentage: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
  buttonContainer: {
    gap: 15,
  },
  processButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  processingButton: {
    backgroundColor: '#666',
  },
  processButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 10,
  },
  resultTitle: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  textContainer: {
    maxHeight: 150,
    marginBottom: 15,
  },
  extractedText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  copyButton: {
    backgroundColor: '#FF9800',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#9C27B0',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  downloadButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  copyButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  previewButton: {
    backgroundColor: '#607D8B',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  previewButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  retakeButton: {
    backgroundColor: '#F44336',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  retakeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  message: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    margin: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalCloseButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F44336',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalTextInput: {
    flex: 1,
    margin: 20,
    padding: 15,
    backgroundColor: '#333',
    color: '#fff',
    borderRadius: 10,
    fontSize: 16,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    padding: 20,
    gap: 15,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#666',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalSaveButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalSaveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
