import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  Animated,
  Linking,
  ActivityIndicator,
} from 'react-native';
import MaterialIcon from '@react-native-vector-icons/material-icons';
import {AuthService, User} from '../services/firebaseAuthService';
import firestore from '@react-native-firebase/firestore';
import { useDarkMode } from '../contexts/DarkModeContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import Card from '../components/Card';
import Modal from '../components/Modal';

const AccountScreen = ({navigation}: any) => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { plan, loading: subscriptionLoading } = useSubscription();
  const [user, setUser] = useState<User | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [usage, setUsage] = useState<{
    aiMessages: number;
    summaryNotes: number;
    detailedNotes: number;
    bulletNotes: number;
    pdfExports: number;
  } | null>(null);
  const [limits, setLimits] = useState<{
    aiMessages: number;
    summaryNotes: number;
    detailedNotes: number;
    bulletNotes: number;
    pdfExports: number;
  } | null>(null);
  const [usageLoading, setUsageLoading] = useState(true);
  
  // Animated values for progress bars
  const detailedProgress = useState(new Animated.Value(0))[0];
  const bulletProgress = useState(new Animated.Value(0))[0];
  const summaryProgress = useState(new Animated.Value(100))[0];
  const aiProgress = useState(new Animated.Value(0))[0];
  
  // Animated value for subscription icon
  const subscriptionIconScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Get current user when component mounts
    const currentUser = AuthService.getCurrentUser();
    setUser(currentUser);

    // Listen for auth state changes
    const unsubscribe = AuthService.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  // Load usage and limits data with real-time updates
  useEffect(() => {
    if (!user) {
      setUsageLoading(false);
      return;
    }

    setUsageLoading(true);

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // Set up real-time listener for usage data
    const unsubscribe = firestore()
      .collection('daily_usage')
      .doc(`${user.uid}_${today}`)
      .onSnapshot(
        (doc) => {
          const defaultUsage = {
            aiMessages: 0,
            summaryNotes: 0,
            detailedNotes: 0,
            bulletNotes: 0,
            pdfExports: 0
          };

          const usageData = doc.exists ? { ...defaultUsage, ...doc.data() } : defaultUsage;
          setUsage(usageData);

          // Get limits based on current plan
          const planLimits = {
            free: {
              aiMessages: 5,
              summaryNotes: 3,
              detailedNotes: 2,
              bulletNotes: 3,
              pdfExports: 1
            },
            'pro-monthly': {
              aiMessages: 500,
              summaryNotes: 100,
              detailedNotes: 100,
              bulletNotes: 100,
              pdfExports: 20
            },
            'pro-yearly': {
              aiMessages: 500,
              summaryNotes: 100,
              detailedNotes: 100,
              bulletNotes: 100,
              pdfExports: 20
            },
            'premium-monthly': {
              aiMessages: 1000,
              summaryNotes: -1,
              detailedNotes: -1,
              bulletNotes: -1,
              pdfExports: -1
            },
            'premium-yearly': {
              aiMessages: 1000,
              summaryNotes: -1,
              detailedNotes: -1,
              bulletNotes: -1,
              pdfExports: -1
            }
          };

          setLimits(planLimits[plan || 'free']);
          setUsageLoading(false);
        },
        (error) => {
          console.error('Error loading usage data:', error);
          setUsageLoading(false);
        }
      );

    // Clean up listener on unmount
    return () => unsubscribe();
  }, [user, plan]);

  // Animate subscription icon when plan changes
  useEffect(() => {
    Animated.sequence([
      Animated.timing(subscriptionIconScale, {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(subscriptionIconScale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [plan]);

  // Animate progress bars when usage data changes
  useEffect(() => {
    if (!usage || !limits) return;

    const aiPercentage = limits.aiMessages > 0 ? Math.min((usage.aiMessages / limits.aiMessages) * 100, 100) : 0;
    const summaryPercentage = limits.summaryNotes > 0 ? Math.min((usage.summaryNotes / limits.summaryNotes) * 100, 100) : 0;
    const detailedPercentage = limits.detailedNotes > 0 ? Math.min((usage.detailedNotes / limits.detailedNotes) * 100, 100) : 0;
    const bulletPercentage = limits.bulletNotes > 0 ? Math.min((usage.bulletNotes / limits.bulletNotes) * 100, 100) : 0;

    Animated.parallel([
      Animated.timing(detailedProgress, {
        toValue: detailedPercentage,
        duration: 800,
        useNativeDriver: false,
      }),
      Animated.timing(bulletProgress, {
        toValue: bulletPercentage,
        duration: 800,
        useNativeDriver: false,
      }),
      Animated.timing(summaryProgress, {
        toValue: summaryPercentage,
        duration: 800,
        useNativeDriver: false,
      }),
      Animated.timing(aiProgress, {
        toValue: aiPercentage,
        duration: 800,
        useNativeDriver: false,
      }),
    ]).start();
  }, [usage, limits]);


  const goBack = () => {
    navigation.goBack();
  };

  const getSubscriptionIcon = (planType: string) => {
    // Plan tipini ve periyodunu ayır
    const isPro = planType?.includes('pro-');
    const isPremium = planType?.includes('premium-');
    const isYearly = planType?.includes('-yearly');

    // Plan rengini ve etiketini belirle
    let color = '#cd7f32'; // Bronze (Free)
    let label = 'Free Plan';
    let name = 'workspace-premium';

    if (isPro) {
      color = '#ffd700'; // Gold
      label = isYearly ? 'Pro Yearly' : 'Pro Monthly';
      name = 'workspace-premium';
    } else if (isPremium) {
      color = '#b9f2ff'; // Diamond
      label = isYearly ? 'Premium Yearly' : 'Premium Monthly';
      name = 'diamond';
    }

    console.log('🎯 Plan badge:', { planType, isPro, isPremium, isYearly, label });

    return {
      name,
      color,
      label
    };
  };


  const handleSignOut = async () => {
    try {
      await AuthService.signOut();
      setShowSignOutModal(false);
      setShowProfileModal(false);
      navigation.navigate('Login');
    } catch (error: any) {
      console.error('Sign out error:', error);
    }
  };

  const handleNotifications = () => {
    setShowNotificationsModal(true);
  };



  const handleHelp = () => {
    setShowHelpModal(true);
  };

  const handleContactSupport = () => {
    const email = 'sakiryusuf36@gmail.com';
    const subject = 'StudyIQ Support Request';
    const body = 'Hello StudyIQ Support Team,\n\nI need help with:\n\n[Please describe your issue here]\n\nBest regards,';
    
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    Linking.openURL(mailtoUrl).catch(err => {
      console.error('Failed to open email client:', err);
      Alert.alert(
        'Email Client Not Available',
        `Please send your support request to: ${email}`,
        [{ text: 'OK' }]
      );
    });
  };

  const handleTermsOfUse = () => {
    navigation.navigate('Legal', { initialTab: 'terms-of-use' });
  };

  const handlePrivacyPolicy = () => {
    navigation.navigate('Legal', { initialTab: 'privacy' });
  };

  const handleExportData = () => {
    Alert.alert('Export Data', 'Your data will be exported to your device. This feature is coming soon!');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account', 
      '⚠️ WARNING: This will permanently delete your account and all data.\n\n• All your notes will be deleted\n• All subscription data will be removed\n• This action cannot be undone\n\nAre you sure you want to continue?', 
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete Forever', 
          style: 'destructive', 
          onPress: async () => {
            try {
              // Show loading
              Alert.alert('Deleting Account', 'Please wait while we delete your account...');
              
              const currentUser = AuthService.getCurrentUser();
              if (!currentUser) {
                Alert.alert('Error', 'No user found to delete.');
                return;
              }

              try {
                console.log('🚨 Account deletion started for user:', currentUser.uid);
                
                // First delete user data from Firestore while user is still authenticated
                console.log('⏳ Calling deleteUserData...');
                await AuthService.deleteUserData(currentUser.uid);
                console.log('✅ deleteUserData completed successfully');
                
                // Then delete Firebase Auth account
                console.log('⏳ Calling deleteAccount...');
                await AuthService.deleteAccount();
                console.log('✅ deleteAccount completed successfully');
                
                // Navigate to login
                navigation.navigate('Login');
                
                setTimeout(() => {
                  Alert.alert(
                    'Account Deleted', 
                    'Your account has been permanently deleted. Thank you for using StudyIQ.'
                  );
                }, 1000);
                
              } catch (authError: any) {
                if (authError.message.includes('recent login')) {
                  // Handle recent login requirement
                  Alert.alert(
                    'Re-authentication Required',
                    'For security, you need to log out and log back in before deleting your account.\n\nWould you like to sign out now?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { 
                        text: 'Sign Out', 
                        style: 'destructive',
                        onPress: async () => {
                          try {
                            await AuthService.signOut();
                            navigation.navigate('Login');
                            Alert.alert(
                              'Signed Out',
                              'Please log back in and try deleting your account again.'
                            );
                          } catch (signOutError) {
                            console.error('Sign out error:', signOutError);
                          }
                        }
                      }
                    ]
                  );
                } else {
                  throw authError; // Re-throw other errors to be caught by outer catch
                }
              }
              
            } catch (error: any) {
              console.error('Account deletion error:', error);
              Alert.alert(
                'Deletion Failed',
                error.message || 'Failed to delete account. Please try again or contact support.',
                [{ text: 'OK' }]
              );
            }
          }
        }
      ]
    );
  };


  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <MaterialIcon 
              name="arrow-back" 
              size={24} 
              color={isDarkMode ? '#ffffff' : '#1f2937'} 
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, isDarkMode && styles.darkText]}>
            Account
          </Text>
        </View>

        <View style={styles.content}>
          {/* Profile Section */}
          <View style={[styles.profileCard, isDarkMode && styles.darkCard]}>
            <View style={[styles.profileIcon, isDarkMode && styles.darkProfileIcon]}>
              {user ? (
                <Text style={[styles.profileIconText, isDarkMode && styles.darkIconText]}>
                  {user.displayName?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                </Text>
              ) : (
                <MaterialIcon 
                  name="person" 
                  size={24} 
                  color={isDarkMode ? '#9ca3af' : '#6b7280'} 
                />
              )}
            </View>
            <View style={styles.profileInfo}>
              {user ? (
                <>
                  <View style={styles.profileHeader}>
                    <Text style={[styles.profileTitle, isDarkMode && styles.darkText]}>
                      {user.displayName || 'User'}
                    </Text>
                    <Animated.View style={[styles.subscriptionBadge, { backgroundColor: getSubscriptionIcon(plan || 'free').color + '20', transform: [{ scale: subscriptionIconScale }] }]}>
                      <MaterialIcon 
                        name={getSubscriptionIcon(plan || 'free').name} 
                        size={16} 
                        color={getSubscriptionIcon(plan || 'free').color} 
                      />
                      <Text style={[styles.subscriptionLabel, { color: getSubscriptionIcon(plan || 'free').color }]}>
                        {getSubscriptionIcon(plan || 'free').label}
                      </Text>
                    </Animated.View>
                  </View>
                  <Text style={[styles.profileEmail, isDarkMode && styles.darkSecondaryText]}>
                    {user.email}
                  </Text>
                </>
              ) : (
                <>
                  <View style={styles.profileHeader}>
                    <Text style={[styles.profileTitle, isDarkMode && styles.darkText]}>
                      Login
                    </Text>
                    <Animated.View style={[styles.subscriptionBadge, { backgroundColor: getSubscriptionIcon(plan || 'free').color + '20', transform: [{ scale: subscriptionIconScale }] }]}>
                      <MaterialIcon 
                        name={getSubscriptionIcon(plan || 'free').name} 
                        size={16} 
                        color={getSubscriptionIcon(plan || 'free').color} 
                      />
                      <Text style={[styles.subscriptionLabel, { color: getSubscriptionIcon(plan || 'free').color }]}>
                        {getSubscriptionIcon(plan || 'free').label}
                      </Text>
                    </Animated.View>
                  </View>
                  <Text style={styles.upgradeText}>Sign in to sync your notes</Text>
                </>
              )}
            </View>
            {user && (
              <TouchableOpacity 
                onPress={() => setShowSignOutModal(true)}
                style={styles.signOutButton}
              >
                <MaterialIcon 
                  name="logout" 
                  size={24} 
                  color={isDarkMode ? '#9ca3af' : '#6b7280'} 
                />
              </TouchableOpacity>
            )}
            {!user && (
              <TouchableOpacity 
                onPress={() => navigation.navigate('Login')}
                style={styles.signOutButton}
              >
                <MaterialIcon 
                  name="login" 
                  size={24} 
                  color={isDarkMode ? '#9ca3af' : '#6b7280'} 
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Usage Card */}
          <TouchableOpacity 
            style={[styles.usageCard, isDarkMode && styles.darkCard]}
            onPress={() => navigation.navigate('DailyUsage')}
          >
            <View style={styles.usageCardContent}>
              <View style={[styles.usageIconContainer, { backgroundColor: isDarkMode ? '#374151' : '#f3f4f6' }]}>
                <MaterialIcon 
                  name="analytics" 
                  size={24} 
                  color={isDarkMode ? '#ffffff' : '#000000'} 
                />
              </View>
              <View style={styles.usageTextContent}>
                <Text style={[styles.usageTitle, isDarkMode && styles.darkText]}>
                  Usage Dashboard
                </Text>
                <Text style={[styles.usageSubtitle, isDarkMode && styles.darkSecondaryText]} numberOfLines={1}>
                  View detailed usage statistics
                </Text>
              </View>
              <MaterialIcon 
                name="chevron-right" 
                size={24} 
                color={isDarkMode ? '#6b7280' : '#9ca3af'} 
              />
            </View>
          </TouchableOpacity>

          {/* Settings Options */}
          <View style={[styles.settingsCard, isDarkMode && styles.darkCard]}>
            <Text style={[styles.settingsTitle, isDarkMode && styles.darkText]}>
              Settings
            </Text>
            
            {/* Dark Mode */}
            <TouchableOpacity style={styles.settingItem} onPress={toggleDarkMode}>
              <View style={styles.settingLeft}>
                <MaterialIcon 
                  name="dark-mode" 
                  size={24} 
                  color={isDarkMode ? '#ffffff' : '#374151'} 
                />
                <View style={styles.settingText}>
                  <Text style={[styles.settingTitle, isDarkMode && styles.darkText]}>
                    Dark Mode
                  </Text>
                  <Text style={[styles.settingSubtitle, isDarkMode && styles.darkSubtitle]}>
                    Switch between light and dark themes
                  </Text>
                </View>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={toggleDarkMode}
                trackColor={{false: '#e2e8f0', true: '#38e07b'}}
                thumbColor={isDarkMode ? '#ffffff' : '#ffffff'}
                style={{transform: [{scaleX: 0.9}, {scaleY: 0.9}]}}
              />
            </TouchableOpacity>


          </View>

          {/* Account Options */}
          <View style={[styles.settingsCard, isDarkMode && styles.darkCard]}>
            <Text style={[styles.settingsTitle, isDarkMode && styles.darkText]}>
              Account
            </Text>
            

            {/* Export Data */}
            <TouchableOpacity style={styles.settingItem} onPress={handleExportData}>
              <View style={styles.settingLeft}>
                <MaterialIcon 
                  name="download" 
                  size={24} 
                  color={isDarkMode ? '#ffffff' : '#374151'} 
                />
                <View style={styles.settingText}>
                  <View style={styles.settingTitleContainer}>
                    <Text style={[styles.settingTitle, isDarkMode && styles.darkText]}>
                      Export Data
                    </Text>
                    <View style={styles.soonBadge}>
                      <Text style={styles.soonText}>SOON</Text>
                    </View>
                  </View>
                  <Text style={[styles.settingSubtitle, isDarkMode && styles.darkSubtitle]}>
                    Download your notes and data
                  </Text>
                </View>
              </View>
              <MaterialIcon name="chevron-right" size={24} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
            </TouchableOpacity>

            {/* Terms of Use */}
            <TouchableOpacity style={styles.settingItem} onPress={handleTermsOfUse}>
              <View style={styles.settingLeft}>
                <MaterialIcon 
                  name="description" 
                  size={24} 
                  color={isDarkMode ? '#ffffff' : '#374151'} 
                />
                <View style={styles.settingText}>
                  <Text style={[styles.settingTitle, isDarkMode && styles.darkText]}>
                    Terms of Use
                  </Text>
                  <Text style={[styles.settingSubtitle, isDarkMode && styles.darkSubtitle]}>
                    Membership, subscription and usage terms
                  </Text>
                </View>
              </View>
              <MaterialIcon name="chevron-right" size={24} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
            </TouchableOpacity>

            {/* Privacy Policy */}
            <TouchableOpacity style={styles.settingItem} onPress={handlePrivacyPolicy}>
              <View style={styles.settingLeft}>
                <MaterialIcon 
                  name="privacy-tip" 
                  size={24} 
                  color={isDarkMode ? '#ffffff' : '#374151'} 
                />
                <View style={styles.settingText}>
                  <Text style={[styles.settingTitle, isDarkMode && styles.darkText]}>
                    Privacy Policy
                  </Text>
                  <Text style={[styles.settingSubtitle, isDarkMode && styles.darkSubtitle]}>
                    Data protection and privacy policy
                  </Text>
                </View>
              </View>
              <MaterialIcon name="chevron-right" size={24} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
            </TouchableOpacity>

            {/* Delete Account */}
            <TouchableOpacity style={styles.settingItem} onPress={handleDeleteAccount}>
              <View style={styles.settingLeft}>
                <MaterialIcon 
                  name="delete-forever" 
                  size={24} 
                  color={isDarkMode ? '#ffffff' : '#374151'} 
                />
                <View style={styles.settingText}>
                  <Text style={[styles.settingTitle, isDarkMode && styles.darkText]}>
                    Delete Account
                  </Text>
                  <Text style={[styles.settingSubtitle, isDarkMode && styles.darkSubtitle]}>
                    Permanently delete your account
                  </Text>
                </View>
              </View>
              <MaterialIcon name="chevron-right" size={24} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
            </TouchableOpacity>
          </View>


          {/* Support */}
          <View style={[styles.settingsCard, isDarkMode && styles.darkCard]}>
            <Text style={[styles.settingsTitle, isDarkMode && styles.darkText]}>
              Support
            </Text>
            
            {/* Help */}
            <TouchableOpacity style={styles.settingItem} onPress={handleHelp}>
              <View style={styles.settingLeft}>
                <MaterialIcon 
                  name="help" 
                  size={24} 
                  color={isDarkMode ? '#ffffff' : '#374151'} 
                />
                <View style={styles.settingText}>
                  <Text style={[styles.settingTitle, isDarkMode && styles.darkText]}>
                    Help & Support
                  </Text>
                  <Text style={[styles.settingSubtitle, isDarkMode && styles.darkSubtitle]}>
                    Get help and contact support
                  </Text>
                </View>
              </View>
              <MaterialIcon name="chevron-right" size={24} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
            </TouchableOpacity>

            {/* About */}
            <TouchableOpacity style={styles.settingItem} onPress={() => Alert.alert('About', 'StudyIQ v1.0.0\n\nA modern note-taking and AI-powered study assistant.')}>
              <View style={styles.settingLeft}>
                <MaterialIcon 
                  name="info" 
                  size={24} 
                  color={isDarkMode ? '#ffffff' : '#374151'} 
                />
                <View style={styles.settingText}>
                  <Text style={[styles.settingTitle, isDarkMode && styles.darkText]}>
                    About
                  </Text>
                  <Text style={[styles.settingSubtitle, isDarkMode && styles.darkSubtitle]}>
                    App version and information
                  </Text>
                </View>
              </View>
              <MaterialIcon name="chevron-right" size={24} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Sign Out Confirmation Modal */}
      <Modal
        visible={showSignOutModal}
        onClose={() => setShowSignOutModal(false)}
        title="Sign Out"
        subtitle="Are you sure you want to sign out? Your data will remain synced for when you return."
        buttons={[
          {
            text: 'Cancel',
            onPress: () => setShowSignOutModal(false),
            style: 'cancel'
          },
          {
            text: 'Sign Out',
            onPress: handleSignOut,
            style: 'destructive',
            primary: true
          }
        ]}
      />

      {/* Notifications Modal */}
      <Modal
        visible={showNotificationsModal}
        onClose={() => setShowNotificationsModal(false)}
        title="Notifications"
        subtitle="Manage your notification preferences"
        buttons={[
          {
            text: 'Close',
            onPress: () => setShowNotificationsModal(false),
            style: 'cancel'
          }
        ]}
      />



      {/* Help Modal */}
      <Modal
        visible={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        title="Help & Support"
        subtitle="Need help? Contact our support team"
        buttons={[
          {
            text: 'Contact Support',
            onPress: () => {
              setShowHelpModal(false);
              handleContactSupport();
            },
            style: 'default',
            primary: true
          },
          {
            text: 'Close',
            onPress: () => setShowHelpModal(false),
            style: 'cancel'
          }
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    marginTop: 40,
  },
  darkContainer: {
    backgroundColor: '#111827',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 24,
    padding: 8,
  },
  backIcon: {
    fontSize: 24,
    color: '#1f2937',
  },
  darkText: {
    color: '#ffffff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  content: {
    padding: 24,
    gap: 32,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  darkCard: {
    backgroundColor: '#1f2937',
  },
  profileIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  darkProfileIcon: {
    backgroundColor: '#374151',
  },
  profileIconText: {
    fontSize: 24,
    color: '#6b7280',
  },
  darkIconText: {
    color: '#9ca3af',
  },
  profileInfo: {
    flex: 1,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  profileTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  subscriptionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  subscriptionLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  upgradeText: {
    fontSize: 14,
    color: '#38e07b',
  },
  chevronIcon: {
    fontSize: 20,
    color: '#9ca3af',
  },
  darkChevronIcon: {
    color: '#6b7280',
  },
  signOutButton: {
    padding: 8,
    borderRadius: 20,
  },
  usageCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  usageCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  usageIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  usageTextContent: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  usageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  usageSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '400',
  },
  usageSection: {
    marginBottom: 16,
  },
  usageSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  usageLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  usageValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  progressBarContainer: {
    marginTop: 4,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  darkProgressBar: {
    backgroundColor: '#374151',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  darkSecondaryText: {
    color: '#9ca3af',
  },
  settingsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    flex: 1,
    marginLeft: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  darkSubtitle: {
    color: '#9ca3af',
  },
  settingTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  soonBadge: {
    backgroundColor: '#fbbf24',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  soonText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
  },
});

export default AccountScreen;