import React from 'react';
import {
  View,
  Text,
  Modal as RNModal,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Dimensions,
} from 'react-native';
import MaterialIcon from '@react-native-vector-icons/material-icons';
import { useDarkMode } from '../contexts/DarkModeContext';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  icon?: string;
  iconColor?: string;
  children?: React.ReactNode;
  buttons?: Array<{
    text: string;
    onPress: () => void;
    style?: 'default' | 'cancel' | 'destructive';
    primary?: boolean;
  }>;
  style?: ViewStyle;
}

const { width } = Dimensions.get('window');

const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  subtitle,
  icon,
  iconColor = '#3b82f6',
  children,
  buttons = [],
  style,
}) => {
  const { isDarkMode } = useDarkMode();

  const getButtonStyle = (buttonStyle: string, primary: boolean) => {
    if (primary) {
      return [styles.primaryButton, isDarkMode && styles.darkPrimaryButton];
    }
    
    switch (buttonStyle) {
      case 'destructive':
        return [styles.destructiveButton, isDarkMode && styles.darkDestructiveButton];
      case 'cancel':
        return [styles.cancelButton, isDarkMode && styles.darkCancelButton];
      default:
        return [styles.defaultButton, isDarkMode && styles.darkDefaultButton];
    }
  };

  const getButtonTextStyle = (buttonStyle: string, primary: boolean) => {
    if (primary) {
      return [styles.primaryButtonText, isDarkMode && styles.darkPrimaryButtonText];
    }
    
    switch (buttonStyle) {
      case 'destructive':
        return [styles.destructiveButtonText, isDarkMode && styles.darkDestructiveButtonText];
      case 'cancel':
        return [styles.cancelButtonText, isDarkMode && styles.darkCancelButtonText];
      default:
        return [styles.defaultButtonText, isDarkMode && styles.darkDefaultButtonText];
    }
  };

  return (
    <RNModal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, isDarkMode && styles.darkModalContainer, style]}>
          {/* Header */}
          {(title || subtitle || icon) && (
            <View style={styles.header}>
              {icon && (
                <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
                  <Text style={[styles.icon, { color: iconColor }]}>{icon}</Text>
                </View>
              )}
              <View style={styles.headerText}>
                {title && (
                  <Text style={[styles.title, isDarkMode && styles.darkTitle]}>
                    {title}
                  </Text>
                )}
                {subtitle && (
                  <Text style={[styles.subtitle, isDarkMode && styles.darkSubtitle]}>
                    {subtitle}
                  </Text>
                )}
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <MaterialIcon
                  name="close"
                  size={24}
                  color={isDarkMode ? '#9ca3af' : '#6b7280'}
                />
              </TouchableOpacity>
            </View>
          )}

          {/* Content */}
          {children && (
            <View style={styles.content}>
              {children}
            </View>
          )}

          {/* Buttons */}
          {buttons.length > 0 && (
            <View style={styles.buttonContainer}>
              {buttons.map((button, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.button,
                    getButtonStyle(button.style || 'default', button.primary || false),
                    index === buttons.length - 1 && styles.lastButton,
                  ]}
                  onPress={() => {
                    button.onPress();
                    if (!button.primary) {
                      onClose();
                    }
                  }}
                >
                  <Text style={getButtonTextStyle(button.style || 'default', button.primary || false)}>
                    {button.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    width: width * 0.9,
    maxWidth: 400,
    maxHeight: '80%',
  },
  darkModalContainer: {
    backgroundColor: '#1f2937',
    borderColor: '#374151',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  icon: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  darkTitle: {
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  darkSubtitle: {
    color: '#9ca3af',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    padding: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 0,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lastButton: {
    marginRight: 0,
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
  },
  darkPrimaryButton: {
    backgroundColor: '#2563eb',
  },
  defaultButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  darkDefaultButton: {
    backgroundColor: '#374151',
    borderColor: '#4b5563',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  darkCancelButton: {
    backgroundColor: '#374151',
    borderColor: '#4b5563',
  },
  destructiveButton: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  darkDestructiveButton: {
    backgroundColor: '#374151',
    borderColor: '#4b5563',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  darkPrimaryButtonText: {
    color: '#ffffff',
  },
  defaultButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '500',
  },
  darkDefaultButtonText: {
    color: '#d1d5db',
  },
  cancelButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '500',
  },
  darkCancelButtonText: {
    color: '#9ca3af',
  },
  destructiveButtonText: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: '500',
  },
  darkDestructiveButtonText: {
    color: '#ef4444',
  },
});

export default Modal;

