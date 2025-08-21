import ImageSourceSelector from '@/components/ImageSourceSelector';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [scanMode, setScanMode] = useState<'quick' | 'document'>('quick');

  const handleQuickScan = () => {
    setScanMode('quick');
    setShowImageSelector(true);
  };

  const handleScanDocument = () => {
    setScanMode('document');
    setShowImageSelector(true);
  };

  const handleBackFromImageSelector = () => {
    setShowImageSelector(false);
  };

  const handleShowManual = () => {
    setShowManual(!showManual);
  };

  if (showImageSelector) {
    return <ImageSourceSelector onBack={handleBackFromImageSelector} scanMode={scanMode} />;
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            📄 Escáner Word
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Convierte texto manuscrito a documentos Word
          </ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.buttonContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleQuickScan}>
            <ThemedText style={styles.buttonIcon}>⚡</ThemedText>
            <View style={styles.buttonContent}>
              <ThemedText style={styles.buttonText}>Escaneo Rápido</ThemedText>
              <ThemedText style={styles.buttonDescription}>Toma foto y procesa inmediatamente</ThemedText>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.primaryButton} onPress={handleScanDocument}>
            <ThemedText style={styles.buttonIcon}>📄</ThemedText>
            <View style={styles.buttonContent}>
              <ThemedText style={styles.buttonText}>Escanear Documento</ThemedText>
              <ThemedText style={styles.buttonDescription}>Escaneo con opciones avanzadas</ThemedText>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={handleShowManual}>
            <ThemedText style={styles.buttonIcon}>📚</ThemedText>
            <ThemedText style={styles.secondaryButtonText}>
              {showManual ? 'Ocultar Manual' : 'Manual de Usuario'}
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {showManual && (
          <ThemedView style={styles.manualContainer}>
            <ThemedText type="subtitle" style={styles.manualTitle}>
              📖 Guía de Uso
            </ThemedText>
            
            <ThemedView style={styles.stepContainer}>
              <ThemedText style={styles.stepNumber}>1️⃣</ThemedText>
              <ThemedView style={styles.stepContent}>
                <ThemedText style={styles.stepTitle}>Preparar el Documento</ThemedText>
                <ThemedText style={styles.stepDescription}>
                  Coloca el documento en una superficie plana con buena iluminación
                </ThemedText>
              </ThemedView>
            </ThemedView>

            <ThemedView style={styles.stepContainer}>
              <ThemedText style={styles.stepNumber}>2️⃣</ThemedText>
              <ThemedView style={styles.stepContent}>
                <ThemedText style={styles.stepTitle}>Tomar la Foto</ThemedText>
                <ThemedText style={styles.stepDescription}>
                  Presiona &quot;Escaneo Rápido&quot; y centra el texto en la cámara
                </ThemedText>
              </ThemedView>
            </ThemedView>

            <ThemedView style={styles.stepContainer}>
              <ThemedText style={styles.stepNumber}>3️⃣</ThemedText>
              <ThemedView style={styles.stepContent}>
                <ThemedText style={styles.stepTitle}>Procesar OCR</ThemedText>
                <ThemedText style={styles.stepDescription}>
                  La app extraerá automáticamente el texto de la imagen
                </ThemedText>
              </ThemedView>
            </ThemedView>

            <ThemedView style={styles.stepContainer}>
              <ThemedText style={styles.stepNumber}>4️⃣</ThemedText>
              <ThemedView style={styles.stepContent}>
                <ThemedText style={styles.stepTitle}>Vista Previa</ThemedText>
                <ThemedText style={styles.stepDescription}>
                  Revisa y edita el texto extraído antes de generar el documento
                </ThemedText>
              </ThemedView>
            </ThemedView>

            <ThemedView style={styles.stepContainer}>
              <ThemedText style={styles.stepNumber}>5️⃣</ThemedText>
              <ThemedView style={styles.stepContent}>
                <ThemedText style={styles.stepTitle}>Descargar Word</ThemedText>
                <ThemedText style={styles.stepDescription}>
                  Genera y descarga tu documento Word listo para usar
                </ThemedText>
              </ThemedView>
            </ThemedView>

            <ThemedView style={styles.tipsContainer}>
              <ThemedText style={styles.tipsTitle}>💡 Consejos:</ThemedText>
              <ThemedText style={styles.tipText}>• Usa buena iluminación natural</ThemedText>
              <ThemedText style={styles.tipText}>• Mantén la cámara estable</ThemedText>
              <ThemedText style={styles.tipText}>• Asegúrate de que el texto sea legible</ThemedText>
              <ThemedText style={styles.tipText}>• Evita sombras sobre el documento</ThemedText>
            </ThemedView>

            <ThemedView style={styles.networkInfo}>
              <ThemedText style={styles.networkTitle}>🌐 Configuración de Red</ThemedText>
              <ThemedText style={styles.networkText}>
                • Expo Go: http://192.168.20.131:8891 ✅
              </ThemedText>
              <ThemedText style={styles.networkText}>
                • Emulador: http://10.0.2.2:8891
              </ThemedText>
              <ThemedText style={styles.networkText}>
                • Asegúrate de estar en la misma WiFi que tu PC
              </ThemedText>
            </ThemedView>
          </ThemedView>
        )}

        <ThemedView style={styles.quickAccessContainer}>
          <ThemedText style={styles.quickAccessTitle}>⚡ Acceso Rápido</ThemedText>
          <TouchableOpacity style={styles.quickButton} onPress={handleQuickScan}>
            <ThemedText style={styles.quickButtonText}>🚀 Escanear Ahora</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
    marginHorizontal: 20,
  },
  buttonContainer: {
    marginBottom: 30,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  buttonContent: {
    flex: 1,
  },
  buttonDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    justifyContent: 'center',
  },
  buttonIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  manualContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  manualTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  stepContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  stepNumber: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
  },
  tipsContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 4,
  },
  networkInfo: {
    marginTop: 16,
    padding: 16,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: 8,
  },
  networkTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#007AFF',
  },
  networkText: {
    fontSize: 13,
    opacity: 0.9,
    marginBottom: 4,
  },
  quickAccessContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  quickAccessTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  quickButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  quickButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});
