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
  Linking,
} from 'react-native';
import MaterialIcon from '@react-native-vector-icons/material-icons';
import {AuthService} from '../services/firebaseAuthService';
import { useDarkMode } from '../contexts/DarkModeContext';

interface SignUpScreenProps {
  navigation: {
    navigate: (screen: string) => void;
    goBack: () => void;
  };
}

const SignUpScreen = ({navigation}: SignUpScreenProps) => {
  const { isDarkMode } = useDarkMode();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const handleSignUp = async () => {
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    if (!agreeToTerms) {
      Alert.alert('Error', 'Please accept the Terms & Conditions');
      return;
    }

    setIsLoading(true);
    
    try {
      const user = await AuthService.signUp(email.trim(), password, name.trim());
      
      // Registration successful, try to create user profile
      try {
        setTimeout(async () => {
          try {
            await AuthService.createUserProfile(user);
            console.log('✅ User profile created after signup');
          } catch (profileError) {
            console.warn('⚠️ Profile creation delayed, will retry later');
          }
        }, 2000); // Try after 2 seconds
      } catch (profileError) {
        // Registration successful even if profile creation fails
        console.warn('Profile creation will be handled later');
      }

      Alert.alert(
        'Account Created',
        'Your account has been created successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Main'),
          },
        ]
      );
    } catch (error: any) {
      // Special handling for email already exists error
      if (error.message && error.message.includes('email address is already registered')) {
        Alert.alert(
          'Email Already Registered',
          'This email address is already registered. Would you like to log in?',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Log In',
              onPress: () => navigation.navigate('Login'),
            },
          ]
        );
      } else {
        Alert.alert('Registration Failed', error.message || 'Please try again later');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = name.trim() && email.trim() && password.trim() && 
                     confirmPassword.trim() && password === confirmPassword && 
                     password.length >= 6 && agreeToTerms;

  return (
    <KeyboardAvoidingView
      style={[styles.container, isDarkMode && styles.darkContainer]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled">
        
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <MaterialIcon name="arrow-back" size={24} color={isDarkMode ? "#ffffff" : "#1a1c1f"} />
          </TouchableOpacity>
          
          <View style={[styles.logoContainer, isDarkMode && styles.darkLogoContainer]}>
            <MaterialIcon name="menu-book" size={60} color={isDarkMode ? "#000000" : "#000000"} />
          </View>
          <Text style={[styles.title, isDarkMode && styles.darkText]}>Create Account</Text>
          <Text style={[styles.subtitle, isDarkMode && styles.darkSubtitle]}>Join StudyIQ and start organizing your notes</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, isDarkMode && styles.darkInput]}
              placeholder="Full Name"
              placeholderTextColor={isDarkMode ? "#6b7280" : "#9ca3af"}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoComplete="name"
            />
          </View>

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
              placeholder="Password (min. 6 characters)"
              placeholderTextColor={isDarkMode ? "#6b7280" : "#9ca3af"}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoComplete="password-new"
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

          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, isDarkMode && styles.darkInput]}
              placeholder="Confirm Password"
              placeholderTextColor={isDarkMode ? "#6b7280" : "#9ca3af"}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoComplete="password-new"
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <MaterialIcon
                name={showConfirmPassword ? 'visibility-off' : 'visibility'}
                size={24}
                color={isDarkMode ? "#6b7280" : "#9ca3af"}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.termsContainer}>
            <TouchableOpacity
              style={[styles.checkbox, agreeToTerms && (isDarkMode ? styles.darkCheckedCheckbox : styles.checkedCheckbox)]}
              onPress={() => setAgreeToTerms(!agreeToTerms)}>
              {agreeToTerms && (
                <MaterialIcon name="check" size={16} color="white" />
              )}
            </TouchableOpacity>
            <Text style={[styles.termsText, isDarkMode && styles.darkSubtext]}>
              I agree to the{' '}
              <Text 
                style={[styles.termsLink, isDarkMode && styles.darkPurpleText]}
                onPress={(e) => {
                  e.stopPropagation();
                  navigation.navigate('Legal', { initialTab: 'terms-of-use' });
                }}
              >
                Terms & Conditions
              </Text>
              {' '}and{' '}
              <Text 
                style={[styles.termsLink, isDarkMode && styles.darkPurpleText]}
                onPress={(e) => {
                  e.stopPropagation();
                  Linking.openURL('https://www.termsfeed.com/live/a8e928db-68f9-48ae-b680-81fdce6e8c0d');
                }}
              >
                Privacy Policy
              </Text>
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.signUpButton, (!isFormValid || isLoading) && styles.disabledButton]}
            onPress={handleSignUp}
            disabled={!isFormValid || isLoading}>
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.signUpButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={[styles.loginText, isDarkMode && styles.darkSubtext]}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={[styles.loginLink, isDarkMode && styles.darkPurpleText]}>Log In</Text>
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
  darkCheckedCheckbox: {
    backgroundColor: '#ffffff',
    borderColor: '#ffffff',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: 8,
    zIndex: 1,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    marginTop: 20,
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1c1f',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
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
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkedCheckbox: {
    backgroundColor: '#4f46e5',
    borderColor: '#4f46e5',
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  termsLink: {
    color: '#4f46e5',
    fontWeight: '600',
  },
  signUpButton: {
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
  signUpButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginText: {
    fontSize: 14,
    color: '#64748b',
  },
  loginLink: {
    fontSize: 14,
    color: '#4f46e5',
    fontWeight: '600',
  },
});

export default SignUpScreen;