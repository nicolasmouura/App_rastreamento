import { Text } from 'react-native';

// Componente "burro": só recebe o texto via props e exibe.
export default function StatusLocalizacao({ texto }) {
  return <Text>{texto}</Text>;
}
