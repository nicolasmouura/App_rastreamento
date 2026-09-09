import { useRef, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { SafeAreaView } from 'react-native-safe-area-context';

import CameraControls from './CameraControls';
import PreviewModal from './PreviewModal';

export default function CameraScreen({ onPhotoTaken, onCancel }) {
  const cameraRef = useRef(null);

  const [facing, setFacing] = useState('back');
  const [capturedImage, setCapturedImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isTakingPicture, setIsTakingPicture] = useState(false);

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  async function requestPermissions() {
    try {
      const result = await requestCameraPermission();

      if (!result.granted) {
        Alert.alert(
          'Permissão necessária',
          'É necessário permitir o uso da câmera.'
        );
      }
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);

      Alert.alert(
        'Erro',
        'Não foi possível solicitar a permissão da câmera.'
      );
    }
  }

  function toggleCameraFacing() {
    setFacing((current) => (
      current === 'back' ? 'front' : 'back'
    ));
  }

  async function takePicture() {
    if (!cameraRef.current || isTakingPicture) {
      return;
    }

    try {
      setIsTakingPicture(true);

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: true,
      });

      if (!photo?.uri) {
        throw new Error('A câmera não retornou uma foto válida.');
      }

      setCapturedImage(photo.uri);
      setModalVisible(true);

    } catch (error) {
      console.error('Erro ao tirar foto:', error);

      Alert.alert(
        'Erro',
        'Não foi possível tirar a foto.'
      );
    } finally {
      setIsTakingPicture(false);
    }
  }

  function retakePicture() {
    setCapturedImage(null);
    setModalVisible(false);
  }

  function confirmPicture() {
    if (!capturedImage) {
      return;
    }

    setModalVisible(false);

    if (onPhotoTaken) {
      onPhotoTaken(capturedImage);
    }
  }

  function closeCamera() {
    setCapturedImage(null);
    setModalVisible(false);

    if (onCancel) {
      onCancel();
    }
  }

  if (!cameraPermission) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>
          Verificando permissão da câmera...
        </Text>
      </View>
    );
  }

  if (!cameraPermission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionTitle}>
          Permissão da câmera
        </Text>

        <Text style={styles.permissionMessage}>
          Para tirar fotos, precisamos acessar a câmera do celular.
        </Text>

        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermissions}
        >
          <Text style={styles.permissionButtonText}>
            Permitir câmera
          </Text>
        </TouchableOpacity>

        {onCancel && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={closeCamera}
          >
            <Text style={styles.cancelButtonText}>
              Cancelar
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'bottom']}
    >
      <View style={styles.cameraContainer}>

        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing={facing}
          mode="picture"
        />

        {onCancel && (
          <TouchableOpacity
            style={styles.closeCameraButton}
            onPress={closeCamera}
            disabled={isTakingPicture}
          >
            <Text style={styles.closeCameraText}>
              ✕
            </Text>
          </TouchableOpacity>
        )}

        <CameraControls
          onFlip={toggleCameraFacing}
          onCapture={takePicture}
          isSaving={isTakingPicture}
        />

      </View>

      <PreviewModal
        visible={modalVisible}
        imageUri={capturedImage}
        onClose={retakePicture}
        onConfirm={confirmPicture}
        onRetake={retakePicture}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  cameraContainer: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#000',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },

  loadingText: {
    color: '#fff',
    fontSize: 16,
  },

  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    backgroundColor: '#fff',
  },

  permissionTitle: {
    marginBottom: 12,
    color: '#111827',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  permissionMessage: {
    marginBottom: 25,
    color: '#4b5563',
    fontSize: 16,
    lineHeight: 23,
    textAlign: 'center',
  },

  permissionButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#2563eb',
  },

  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  cancelButton: {
    marginTop: 15,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },

  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: 'bold',
  },

  closeCameraButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 23,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 10,
  },

  closeCameraText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
});