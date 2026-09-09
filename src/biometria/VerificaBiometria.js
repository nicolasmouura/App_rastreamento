import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { useEffect, useState } from 'react';

// Tela de ENTRADA do app. Guarda o estado/lógica da biometria
// e avisa o App.js (via props.onAutenticado) quando o login der certo.
export default function VerificaBiometria({ onAutenticado }) {
  const [biometria, setBiometria] = useState(false);

  useEffect(() => {
    (async () => {
      const compativel = await LocalAuthentication.hasHardwareAsync();
      setBiometria(compativel);
    })();
  }, []);

  const entrar = async () => {
    const authentication = await LocalAuthentication.authenticateAsync();
    if (authentication.success) {
      onAutenticado();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo</Text>
      <Text style={styles.subtitle}>
        {biometria
          ? 'Toque em Entrar e use sua biometria'
          : 'Dispositivo não compatível com biometria'}
      </Text>
      <TouchableOpacity style={styles.button} onPress={entrar} disabled={!biometria}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#4b5563',
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    width: 200,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#2563eb',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
