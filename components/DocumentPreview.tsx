import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import React from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface DocumentPreviewProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  text: string;
  onDownload: () => void;
}

export default function DocumentPreview({
  visible,
  onClose,
  title,
  text,
  onDownload,
}: DocumentPreviewProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <ThemedText type="subtitle" style={styles.headerTitle}>
            Vista Previa del Documento
          </ThemedText>
          <TouchableOpacity onPress={onDownload} style={styles.downloadButton}>
            <Text style={styles.downloadButtonText}>💾</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.previewContainer}>
          {/* Simulación de un documento Word */}
          <View style={styles.documentContainer}>
            <View style={styles.documentHeader}>
              <Text style={styles.documentTitle}>{title}</Text>
              <Text style={styles.documentDate}>
                {new Date().toLocaleDateString()}
              </Text>
            </View>
            
            <View style={styles.documentBody}>
              <Text style={styles.documentText}>{text}</Text>
            </View>
            
            <View style={styles.documentFooter}>
              <Text style={styles.footerText}>
                Generado con Escáner Word OCR
              </Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.editButton]} 
            onPress={() => {/* TODO: Implementar edición */}}
          >
            <Text style={styles.actionButtonText}>✏️ Editar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.downloadActionButton]} 
            onPress={onDownload}
          >
            <Text style={styles.actionButtonText}>📄 Descargar Word</Text>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  downloadButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#007bff',
  },
  downloadButtonText: {
    fontSize: 18,
    color: 'white',
  },
  previewContainer: {
    flex: 1,
    padding: 20,
  },
  documentContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 500,
  },
  documentHeader: {
    borderBottomWidth: 2,
    borderBottomColor: '#007bff',
    paddingBottom: 15,
    marginBottom: 20,
  },
  documentTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  documentDate: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  documentBody: {
    flex: 1,
    marginBottom: 20,
  },
  documentText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    fontFamily: 'System', // En un documento real usarías Times New Roman
  },
  documentFooter: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 15,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  actionContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#6c757d',
  },
  downloadActionButton: {
    backgroundColor: '#28a745',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
