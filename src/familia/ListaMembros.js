import { StyleSheet, View } from 'react-native';
import MembroCard from './MembroCard';

export default function ListaMembros({ membros }) {
  return (
    <View style={styles.container}>
      {membros.map((membro) => (
        <MembroCard
          key={membro.id}
          nome={membro.nome}
          parentesco={membro.parentesco}
          online={membro.online}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
});