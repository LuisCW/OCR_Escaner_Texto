import { ThemedText } from '@/components/ThemedText';
import React, { useState } from 'react';
import { Alert, TouchableOpacity } from 'react-native';

interface NetworkTestProps {
  style?: any;
}

export default function NetworkTest({ style }: NetworkTestProps) {
  const [testing, setTesting] = useState(false);

  const testConnection = async () => {
    setTesting(true);
    try {
      const API_BASE_URL = __DEV__ 
        ? 'http://192.168.20.131:8891'  // Tu IP real para Expo Go
        : 'http://192.168.20.131:8891';
      
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
      });

      if (response.ok) {
        const result = await response.json();
        Alert.alert('✅ Conexión OK', `Servidor funcionando: ${result.message}`);
      } else {
        Alert.alert('❌ Error', `Servidor respondió con código: ${response.status}`);
      }
    } catch {
      Alert.alert('❌ Sin Conexión', 'No se pudo conectar al servidor OCR. Verifica que esté ejecutándose.');
    } finally {
      setTesting(false);
    }
  };

  return (
    <TouchableOpacity 
      style={[{ 
        backgroundColor: testing ? '#FF9500' : '#34C759',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
      }, style]}
      onPress={testConnection}
      disabled={testing}
    >
      <ThemedText style={{ color: 'white', fontWeight: 'bold' }}>
        {testing ? '🔄 Probando...' : '🌐 Probar Conexión'}
      </ThemedText>
    </TouchableOpacity>
  );
}
