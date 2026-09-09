import { Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PreviewModal({
  visible,
  imageUri,
  onClose,
  onConfirm,
  onRetake,
}) {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <Text style={styles.title}>Pré-visualização</Text>

        {imageUri && (
          <Image
            style={styles.previewImage}
            source={{ uri: imageUri }}
            resizeMode="contain"
          />
        )}

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onRetake}
          >
            <Text style={styles.secondaryButtonText}>
              Tirar novamente
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={onConfirm}
          >
            <Text style={styles.primaryButtonText}>
              Usar foto
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.96)',
    paddingHorizontal: 20,
  },

  title: {
    position: 'absolute',
    top: 30,
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },

  previewImage: {
    width: '100%',
    height: '70%',
  },

  buttonsContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },

  secondaryButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#374151',
    alignItems: 'center',
  },

  primaryButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#2563eb',
    alignItems: 'center',
  },

  secondaryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },

  primaryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});