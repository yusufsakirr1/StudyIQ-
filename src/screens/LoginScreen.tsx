import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import MaterialIcon from '@react-native-vector-icons/material-icons';
import {AuthService} from '../services/firebaseAuthService';
import { useDarkMode } from '../contexts/DarkModeContext';

interface LoginScreenProps {
  navigation: {
    navigate: (screen: string) => void;
  };
}

const LoginScreen = ({navigation}: LoginScreenProps) => {
  const { isDarkMode } = useDarkMode();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    
    try {
      const user = await AuthService.signIn(email.trim(), password);
      console.log('✅ Login successful:', user.email);
      navigation.navigate('Main');
    } catch (error: any) {
      console.error('❌ Login error:', error);
      Alert.alert('Login Failed', error.message || 'Please check your credentials and try again');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <KeyboardAvoidingView
      style={[styles.container, isDarkMode && styles.darkContainer]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled">
        
        <View style={styles.header}>
          <View style={[styles.logoContainer, isDarkMode && styles.darkLogoContainer]}>
            <MaterialIcon name="menu-book" size={60} color={isDarkMode ? "#000000" : "#000000"} />
          </View>
          <Text style={[styles.title, isDarkMode && styles.darkText]}>Welcome back</Text>
          <Text style={[styles.subtitle, isDarkMode && styles.darkSubtitle]}>Log in to access your notes.</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, isDarkMode && styles.darkInput]}
              placeholder="Email address"
              placeholderTextColor={isDarkMode ? "#6b7280" : "#9ca3af"}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, isDarkMode && styles.darkInput]}
              placeholder="Password"
              placeholderTextColor={isDarkMode ? "#6b7280" : "#9ca3af"}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoComplete="password"
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}>
              <MaterialIcon
                name={showPassword ? 'visibility-off' : 'visibility'}
                size={24}
                color={isDarkMode ? "#6b7280" : "#9ca3af"}
              />
            </TouchableOpacity>
          </View>


          <TouchableOpacity
            style={[styles.loginButton, (!email.trim() || !password.trim() || isLoading) && styles.disabledButton]}
            onPress={handleLogin}
            disabled={!email.trim() || !password.trim() || isLoading}>
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.loginButtonText}>Log In</Text>
            )}
          </TouchableOpacity>

          <View style={styles.signupContainer}>
            <Text style={[styles.signupText, isDarkMode && styles.darkSubtext]}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={[styles.signupLink, isDarkMode && styles.darkPurpleText]}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  darkContainer: {
    backgroundColor: '#111827',
  },
  darkText: {
    color: '#ffffff',
  },
  darkSubtitle: {
    color: '#9ca3af',
  },
  darkInput: {
    backgroundColor: '#1f2937',
    color: '#ffffff',
    borderColor: '#374151',
  },
  darkLogoContainer: {
    backgroundColor: '#ffffff',
  },
  darkPurpleText: {
    color: '#ffffff',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1c1f',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1a1c1f',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    padding: 4,
  },
  loginButton: {
    backgroundColor: '#000000',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
    shadowOpacity: 0,
    elevation: 0,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signupContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  signupText: {
    fontSize: 14,
    color: '#64748b',
  },
  signupLink: {
    fontSize: 14,
    color: '#4f46e5',
    fontWeight: '600',
  },
});

export default LoginScreen;