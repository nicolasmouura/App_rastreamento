import { StyleSheet, View } from 'react-native';
import MembroCard from './MembroCard';

export default function ListaMembros() {
  const membros = [
    {
      id: 1,
      nome: 'João',
      status: 'online',
    },
    {
      id: 2,
      nome: 'Maria',
      status: 'online',
    },
    {
      id: 3,
      nome: 'Pedro',
      status: 'offline',
    },
  ];

  return (
    <View style={styles.container}>
      {membros.map((membro) => (
        <MembroCard
          key={membro.id}
          nome={membro.nome}
          status={membro.status}
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