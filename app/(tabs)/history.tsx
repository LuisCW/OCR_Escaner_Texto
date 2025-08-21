import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import * as FileSystem from 'expo-file-system';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

interface HistoryDocument {
  id: string;
  title: string;
  text: string;
  createdAt: string;
  wordCount: number;
}

export default function HistoryScreen() {
  const [documents, setDocuments] = useState<HistoryDocument[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<HistoryDocument | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const historyPath = FileSystem.documentDirectory + 'ocr_history.json';
      const historyExists = await FileSystem.getInfoAsync(historyPath);
      
      if (historyExists.exists) {
        const historyContent = await FileSystem.readAsStringAsync(historyPath);
        const history = JSON.parse(historyContent);
        setDocuments(history);
      }
    } catch (error) {
      console.log('Error loading history:', error);
    }
  };

  const deleteDocument = async (id: string) => {
    Alert.alert(
      'Eliminar Documento',
      '¿Estás seguro de que quieres eliminar este documento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedDocs = documents.filter(doc => doc.id !== id);
              const historyPath = FileSystem.documentDirectory + 'ocr_history.json';
              await FileSystem.writeAsStringAsync(historyPath, JSON.stringify(updatedDocs));
              setDocuments(updatedDocs);
              setSelectedDoc(null);
            } catch {
              Alert.alert('Error', 'No se pudo eliminar el documento');
            }
          }
        }
      ]
    );
  };

  const clearHistory = async () => {
    Alert.alert(
      'Limpiar Historial',
      '¿Estás seguro de que quieres eliminar todo el historial?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpiar',
          style: 'destructive',
          onPress: async () => {
            try {
              const historyPath = FileSystem.documentDirectory + 'ocr_history.json';
              await FileSystem.writeAsStringAsync(historyPath, JSON.stringify([]));
              setDocuments([]);
              setSelectedDoc(null);
            } catch {
              Alert.alert('Error', 'No se pudo limpiar el historial');
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (selectedDoc) {
    return (
      <ThemedView style={styles.container}>
        <ScrollView style={styles.scrollView}>
          <ThemedView style={styles.headerContainer}>
            <TouchableOpacity style={styles.backButton} onPress={() => setSelectedDoc(null)}>
              <ThemedText style={styles.backButtonText}>← Atrás</ThemedText>
            </TouchableOpacity>
            <ThemedText type="title" style={styles.title}>
              📄 {selectedDoc.title}
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.documentInfo}>
            <ThemedText style={styles.infoText}>
              📅 {formatDate(selectedDoc.createdAt)}
            </ThemedText>
            <ThemedText style={styles.infoText}>
              📝 {selectedDoc.wordCount} palabras
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.textContainer}>
            <ThemedText style={styles.documentText}>
              {selectedDoc.text}
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.deleteButton} 
              onPress={() => deleteDocument(selectedDoc.id)}
            >
              <ThemedText style={styles.deleteButtonText}>🗑️ Eliminar</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ScrollView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            📚 Historial de Documentos
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            {documents.length} documentos guardados
          </ThemedText>
        </ThemedView>

        {documents.length === 0 ? (
          <ThemedView style={styles.emptyContainer}>
            <ThemedText style={styles.emptyIcon}>📝</ThemedText>
            <ThemedText style={styles.emptyTitle}>Sin documentos</ThemedText>
            <ThemedText style={styles.emptyText}>
              Los documentos escaneados aparecerán aquí
            </ThemedText>
          </ThemedView>
        ) : (
          <>
            <ThemedView style={styles.actionContainer}>
              <TouchableOpacity style={styles.clearButton} onPress={clearHistory}>
                <ThemedText style={styles.clearButtonText}>🗑️ Limpiar Todo</ThemedText>
              </TouchableOpacity>
            </ThemedView>

            <ThemedView style={styles.documentsContainer}>
              {documents.map((doc) => (
                <TouchableOpacity
                  key={doc.id}
                  style={styles.documentCard}
                  onPress={() => setSelectedDoc(doc)}
                >
                  <ThemedView style={styles.cardHeader}>
                    <ThemedText style={styles.cardTitle}>{doc.title}</ThemedText>
                    <ThemedText style={styles.cardDate}>
                      {formatDate(doc.createdAt)}
                    </ThemedText>
                  </ThemedView>
                  
                  <ThemedText style={styles.cardPreview} numberOfLines={2}>
                    {doc.text}
                  </ThemedText>
                  
                  <ThemedView style={styles.cardFooter}>
                    <ThemedText style={styles.cardStats}>
                      📝 {doc.wordCount} palabras
                    </ThemedText>
                    <ThemedText style={styles.cardArrow}>→</ThemedText>
                  </ThemedView>
                </TouchableOpacity>
              ))}
            </ThemedView>
          </>
        )}
      </ScrollView>
    </ThemedView>
  );
}

// Función para usar desde otros componentes
export const saveToHistory = async (title: string, text: string) => {
  try {
    const historyPath = FileSystem.documentDirectory + 'ocr_history.json';
    const historyExists = await FileSystem.getInfoAsync(historyPath);
    
    let history: HistoryDocument[] = [];
    if (historyExists.exists) {
      const historyContent = await FileSystem.readAsStringAsync(historyPath);
      history = JSON.parse(historyContent);
    }

    const newDocument: HistoryDocument = {
      id: Date.now().toString(),
      title: title || `Documento ${new Date().toLocaleDateString()}`,
      text,
      createdAt: new Date().toISOString(),
      wordCount: text.split(' ').length
    };

    const updatedHistory = [newDocument, ...history];
    await FileSystem.writeAsStringAsync(historyPath, JSON.stringify(updatedHistory));
    
    return newDocument;
  } catch (error) {
    console.log('Error saving to history:', error);
    return null;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 20,
  },
  headerContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 20,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 20,
    zIndex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  actionContainer: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  clearButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  clearButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  documentsContainer: {
    gap: 12,
  },
  documentCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  cardDate: {
    fontSize: 12,
    opacity: 0.7,
  },
  cardPreview: {
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardStats: {
    fontSize: 12,
    opacity: 0.7,
  },
  cardArrow: {
    fontSize: 16,
    opacity: 0.5,
  },
  documentInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
  },
  infoText: {
    fontSize: 14,
    opacity: 0.8,
  },
  textContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  documentText: {
    fontSize: 16,
    lineHeight: 24,
  },
  actionButtons: {
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
