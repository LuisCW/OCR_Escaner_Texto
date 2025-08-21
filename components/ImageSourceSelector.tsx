import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import CameraScreen from './CameraScreen_new';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface ImageSourceSelectorProps {
  onBack?: () => void;
  scanMode?: 'quick' | 'document';
  onImageSelected?: (imageUri: string) => void;
}

export default function ImageSourceSelector({ onBack, scanMode = 'quick', onImageSelected }: ImageSourceSelectorProps) {
  const [showCamera, setShowCamera] = useState(false);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);

  const handleCameraPress = () => {
    setShowCamera(true);
  };

  const handleGalleryPress = async () => {
    try {
      // Solicitar permisos para acceder a la galería
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert(
          'Permisos requeridos',
          'Necesitas dar permisos para acceder a la galería de fotos.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Abrir la galería
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        setSelectedImageUri(imageUri);
        if (onImageSelected) {
          onImageSelected(imageUri);
        }
      }
    } catch (error) {
      console.error('Error al abrir la galería:', error);
      Alert.alert(
        'Error',
        'No se pudo abrir la galería. Inténtalo de nuevo.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleBackFromCamera = () => {
    setShowCamera(false);
  };

  if (showCamera) {
    return <CameraScreen onBack={handleBackFromCamera} scanMode={scanMode} />;
  }

  if (selectedImageUri) {
    return <CameraScreen onBack={onBack} scanMode={scanMode} externalImageUri={selectedImageUri} />;
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <ThemedText style={styles.backButtonText}>← Atrás</ThemedText>
        </TouchableOpacity>
        <ThemedText type="title" style={styles.title}>
          Seleccionar Fuente
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.content}>
        <ThemedText style={styles.subtitle}>
          ¿Cómo quieres obtener la imagen?
        </ThemedText>

        <TouchableOpacity style={styles.optionButton} onPress={handleCameraPress}>
          <ThemedText style={styles.optionIcon}>📷</ThemedText>
          <View style={styles.optionContent}>
            <ThemedText style={styles.optionTitle}>Tomar Foto</ThemedText>
            <ThemedText style={styles.optionDescription}>
              Usa la cámara para capturar un documento
            </ThemedText>
          </View>
          <ThemedText style={styles.arrow}>→</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionButton} onPress={handleGalleryPress}>
          <ThemedText style={styles.optionIcon}>🖼️</ThemedText>
          <View style={styles.optionContent}>
            <ThemedText style={styles.optionTitle}>Seleccionar de Galería</ThemedText>
            <ThemedText style={styles.optionDescription}>
              Elige una imagen guardada en tu dispositivo
            </ThemedText>
          </View>
          <ThemedText style={styles.arrow}>→</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <ThemedView style={styles.footer}>
        <ThemedText style={styles.footerText}>
          💡 Para mejores resultados, asegúrate de que el texto sea claro y legible
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 20,
  },
  backButton: {
    padding: 10,
    marginRight: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginRight: 50, // Para centrar considerando el botón de atrás
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 40,
    opacity: 0.8,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  optionIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  arrow: {
    fontSize: 20,
    color: '#007AFF',
  },
  footer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  footerText: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.8,
  },
});
