import ImageSourceSelector from '@/components/ImageSourceSelector';
import { StyleSheet } from 'react-native';

export default function TabTwoScreen() {
  return <ImageSourceSelector scanMode="document" />;
}

const styles = StyleSheet.create({
  // Estilos si son necesarios en el futuro
});
