import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import MaterialIcon from '@react-native-vector-icons/material-icons';
import { useDarkMode } from '../contexts/DarkModeContext';

const { width, height } = Dimensions.get('window');

const CameraScreen = ({ navigation }: any) => {
  const { isDarkMode } = useDarkMode();
  const [flashMode, setFlashMode] = useState(false);

  const handleCapture = () => {
    // Fotoğraf çekme işlemi burada yapılacak
    console.log('Capture photo');
  };

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      {/* Header */}
      <View style={[styles.header, isDarkMode && styles.darkHeader]}>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => navigation.goBack()}>
          <MaterialIcon 
            name="close" 
            size={28} 
            color="#ffffff" 
          />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.flashButton}
          onPress={() => setFlashMode(!flashMode)}>
          <MaterialIcon 
            name={flashMode ? "flash-on" : "flash-off"} 
            size={24} 
            color="#ffffff" 
          />
        </TouchableOpacity>
      </View>

      {/* Camera Preview */}
      <View style={styles.preview}>
        <View style={styles.framingGuide}>
          <MaterialIcon 
            name="center-focus-strong" 
            size={40} 
            color="#ffffff" 
          />
        </View>
        <Text style={styles.guideText}>
          Soruyu çerçeve içine alın
        </Text>
      </View>

      {/* Bottom Controls */}
      <View style={[styles.controls, isDarkMode && styles.darkControls]}>
        <TouchableOpacity style={styles.controlButton}>
          <MaterialIcon name="keyboard" size={24} color="#ffffff" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.captureButton} onPress={handleCapture}>
          <View style={styles.captureButtonOuter}>
            <View style={styles.captureButtonInner} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton}>
          <MaterialIcon name="mic" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  darkContainer: {
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  darkHeader: {
    backgroundColor: 'transparent',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flashButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  preview: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  framingGuide: {
    width: width * 0.8,
    height: width * 0.8,
    borderWidth: 2,
    borderColor: '#ffffff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideText: {
    color: '#ffffff',
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 40,
    backgroundColor: 'transparent',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  darkControls: {
    backgroundColor: 'transparent',
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonOuter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#000000',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#000000',
  },
});

export default CameraScreen;
