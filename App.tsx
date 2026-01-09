import React, { useState, useEffect } from 'react';
import { StatusBar, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcon from '@react-native-vector-icons/material-icons';
import HomeScreen from './src/screens/HomeScreen';
import ResultsScreen from './src/screens/ResultsScreen';
import AccountScreen from './src/screens/AccountScreen';
import UpgradeScreen from './src/screens/UpgradeScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import NotesScreen from './src/screens/NotesScreen';
import AITeacherScreen from './src/screens/AITeacherScreen';
import LegalScreen from './src/screens/LegalScreen';

import DailyUsageScreen from './src/screens/DailyUsageScreen';
import { DarkModeProvider, useDarkMode } from './src/contexts/DarkModeContext';
import { SubscriptionProvider } from './src/contexts/SubscriptionContext';
import { SubscriptionChecker } from './src/services/subscriptionChecker';
import { AuthService } from './src/services/firebaseAuthService';
import auth from '@react-native-firebase/auth';
import './src/firebase/config';

type Screen = 'Onboarding' | 'Auth' | 'Login' | 'SignUp' | 'Main' | 'Home' | 'Results' | 'Settings' | 'Upgrade' | 'Notes' | 'AITeacher' | 'Legal' | 'DailyUsage';

function AppContent(): React.JSX.Element {
  const [currentScreen, setCurrentScreen] = useState<Screen>('Onboarding');
  const [resultData, setResultData] = useState<any>(null);
  const [isFirstTime, setIsFirstTime] = useState<boolean | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const { isDarkMode } = useDarkMode();

  // Check if it's first time and authentication state on app start
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check if it's first time
        const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
        const isFirstTimeUser = hasSeenOnboarding === null;
        setIsFirstTime(isFirstTimeUser);

        // Check authentication state
        const user = AuthService.getCurrentUser();
        if (user) {
          setIsAuthenticated(true);
          if (isFirstTimeUser) {
            setCurrentScreen('Onboarding');
          } else {
            setCurrentScreen('Home');
          }
        } else {
          setIsAuthenticated(false);
          if (isFirstTimeUser) {
            setCurrentScreen('Onboarding');
          } else {
            setCurrentScreen('Login');
          }
        }
      } catch (error) {
        console.error('App initialization error:', error);
        setIsAuthenticated(false);
        setIsFirstTime(true);
        setCurrentScreen('Onboarding');
      } finally {
        setIsCheckingAuth(false);
      }
    };

    initializeApp();
  }, []);

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((user) => {
      if (user) {
        setIsAuthenticated(true);
        // Don't automatically redirect if user is already on a valid screen
        if (currentScreen === 'Login' || currentScreen === 'SignUp') {
          setCurrentScreen('Home');
        }
      } else {
        setIsAuthenticated(false);
        // Always redirect to login when user signs out (never to onboarding)
        if (currentScreen !== 'Onboarding' && currentScreen !== 'Login' && currentScreen !== 'SignUp') {
          setCurrentScreen('Login');
        }
      }
    });

    return () => unsubscribe();
  }, [currentScreen]);

  const navigateToResults = (data: any) => {
    setResultData(data);
    setCurrentScreen('Results');
  };

  const goBack = () => {
    setCurrentScreen('Home');
  };

  const renderScreen = () => {
    const navigation = {
      navigate: (screen: Screen, params?: any) => {
        if (screen === 'Results') {
          navigateToResults(params);
        } else if (screen === 'Legal') {
          setResultData(params);
          setCurrentScreen('Legal');
        } else if (screen === 'Auth') {
          setCurrentScreen('Login'); // Default to Login when navigating to Auth
        } else if (screen === 'Main') {
          // Check if user is authenticated before going to main app
          if (isAuthenticated) {
            setCurrentScreen('Home');
          } else {
            setCurrentScreen('Login');
          }
        } else {
          setCurrentScreen(screen);
        }
      },
      goBack: () => {
        // Handle back navigation based on current screen
        switch (currentScreen) {
          case 'SignUp':
            setCurrentScreen('Login');
            break;
          case 'Login':
            setCurrentScreen('Onboarding');
            break;
          case 'Legal':
            setCurrentScreen('Settings');
            break;
          default:
            setCurrentScreen('Home');
        }
      },
      setIsFirstTime: async (value: boolean) => {
        setIsFirstTime(value);
        try {
          if (!value) {
            await AsyncStorage.setItem('hasSeenOnboarding', 'true');
          }
        } catch (error) {
          console.error('Error saving onboarding state:', error);
        }
      },
    };

    // Show loading while checking auth state
    if (isCheckingAuth || isFirstTime === null) {
      return (
        <View style={[styles.loadingContainer, isDarkMode && styles.darkLoadingContainer]}>
          <Text style={[styles.loadingText, isDarkMode && styles.darkLoadingText]}>
            Loading...
          </Text>
        </View>
      );
    }

    // Show onboarding first if it's the first time
    if (currentScreen === 'Onboarding') {
      return <OnboardingScreen navigation={navigation} />;
    }

    // Auth screens
    if (currentScreen === 'Login') {
      return <LoginScreen navigation={navigation} />;
    }

    if (currentScreen === 'SignUp') {
      return <SignUpScreen navigation={navigation} />;
    }

    // Main app screens
    switch (currentScreen) {
      case 'Home':
        return <HomeScreen navigation={navigation} />;
      case 'Results':
        return <ResultsScreen navigation={navigation} route={{ params: resultData }} />;
      case 'Settings':
        return <AccountScreen navigation={navigation} />;
      case 'Upgrade':
        return <UpgradeScreen navigation={navigation} />;
      case 'Notes':
        return <NotesScreen navigation={navigation} />;
      case 'AITeacher':
        return <AITeacherScreen navigation={navigation} />;
      case 'Legal':
        return <LegalScreen navigation={navigation} route={resultData} />;

      case 'DailyUsage':
        return <DailyUsageScreen navigation={navigation} />;
      default:
        return <HomeScreen navigation={navigation} />;
    }
  };

  const shouldShowTabBar = ['Home', 'Results', 'Settings', 'Upgrade', 'Notes', 'AITeacher'].includes(currentScreen);

  return (
    <>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={isDarkMode ? "#111827" : "#f7f9fc"}
      />
      <View style={[styles.container, isDarkMode && styles.darkContainer]}>
        {renderScreen()}

        {/* Bottom Tab Bar - Only show for main app screens */}
        {shouldShowTabBar && (
          <View style={[styles.tabBar, isDarkMode && styles.darkTabBar]}>
            <TouchableOpacity
              style={styles.tabButton}
              onPress={() => setCurrentScreen('Home')}>
              <MaterialIcon
                name="home"
                size={24}
                color={currentScreen === 'Home' ? (isDarkMode ? '#ffffff' : '#000000') : '#9ca3af'}
              />
              <Text style={[
                styles.tabLabel,
                isDarkMode && styles.darkTabLabel,
                currentScreen === 'Home' && (isDarkMode ? styles.darkActiveTabLabel : styles.activeTabLabel)
              ]}>
                Home
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tabButton}
              onPress={() => setCurrentScreen('Notes')}>
              <MaterialIcon
                name="description"
                size={24}
                color={currentScreen === 'Notes' ? (isDarkMode ? '#ffffff' : '#000000') : '#9ca3af'}
              />
              <Text style={[
                styles.tabLabel,
                isDarkMode && styles.darkTabLabel,
                currentScreen === 'Notes' && (isDarkMode ? styles.darkActiveTabLabel : styles.activeTabLabel)
              ]}>
                My Notes
              </Text>
            </TouchableOpacity>



            <TouchableOpacity
              style={styles.tabButton}
              onPress={() => setCurrentScreen('AITeacher')}>
              <View style={styles.aiTeacherIconContainer}>
                <MaterialIcon
                  name="psychology"
                  size={24}
                  color={currentScreen === 'AITeacher' ? (isDarkMode ? '#ffffff' : '#000000') : '#9ca3af'}
                />
                <View style={[styles.betaBadge, isDarkMode && styles.darkBetaBadge]}>
                  <Text style={styles.betaText}>BETA</Text>
                </View>
              </View>
              <Text style={[
                styles.tabLabel,
                isDarkMode && styles.darkTabLabel,
                currentScreen === 'AITeacher' && (isDarkMode ? styles.darkActiveTabLabel : styles.activeTabLabel)
              ]}>
                AI Teacher
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tabButton}
              onPress={() => setCurrentScreen('Settings')}>
              <MaterialIcon
                name="person"
                size={24}
                color={currentScreen === 'Settings' ? (isDarkMode ? '#ffffff' : '#000000') : '#9ca3af'}
              />
              <Text style={[
                styles.tabLabel,
                isDarkMode && styles.darkTabLabel,
                currentScreen === 'Settings' && (isDarkMode ? styles.darkActiveTabLabel : styles.activeTabLabel)
              ]}>
                Account
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  darkLoadingContainer: {
    backgroundColor: '#111827',
  },
  loadingText: {
    fontSize: 16,
    color: '#374151',
  },
  darkLoadingText: {
    color: '#ffffff',
  },
  darkContainer: {
    backgroundColor: '#111827',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    height: 80,
    paddingTop: 8,
    paddingBottom: 20,
  },
  darkTabBar: {
    backgroundColor: '#1f2937',
    borderTopColor: '#374151',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
    color: '#9ca3af',
  },
  darkTabLabel: {
    color: '#9ca3af',
  },
  activeTabLabel: {
    color: '#000000',
  },
  darkActiveTabLabel: {
    color: '#ffffff',
  },
  aiTeacherIconContainer: {
    position: 'relative',
  },
  betaBadge: {
    position: 'absolute',
    top: -1,
    right: -4,
    backgroundColor: '#ff6b35',
    borderRadius: 4,
    paddingHorizontal: 2,
    paddingVertical: 1,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  darkBetaBadge: {
    backgroundColor: '#ff8c42',
  },
  betaText: {
    color: '#ffffff',
    fontSize: 6,
    fontWeight: 'bold',
    letterSpacing: 0.2,
  },
});

function App(): React.JSX.Element {
  return (
    <DarkModeProvider>
      <SubscriptionProvider>
        <AppContent />
      </SubscriptionProvider>
    </DarkModeProvider>
  );
}

export default App;