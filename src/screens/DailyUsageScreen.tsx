import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import MaterialIcon from '@react-native-vector-icons/material-icons';
import firestore from '@react-native-firebase/firestore';
import {AuthService} from '../services/firebaseAuthService';
import {useDarkMode} from '../contexts/DarkModeContext';
import {useSubscription} from '../contexts/SubscriptionContext';
import Card from '../components/Card';

const DailyUsageScreen = ({navigation}: any) => {
  const {isDarkMode} = useDarkMode();
  const {plan, isActive, loading: subscriptionLoading} = useSubscription();
  const [loading, setLoading] = useState(true);
  const [subscriptionEndDate, setSubscriptionEndDate] = useState<Date | null>(null);
  
  // Debug log to see actual plan value
  console.log('Current plan from context:', plan);
  console.log('Is subscription active:', isActive);
  
  const [usage, setUsage] = useState<{
    aiMessages: number;
    summaryNotes: number;
    detailedNotes: number;
    bulletNotes: number;
    pdfExports: number;
  }>({
    aiMessages: 0,
    summaryNotes: 0,
    detailedNotes: 0,
    bulletNotes: 0,
    pdfExports: 0,
  });

  const limits = {
    free: {
      aiMessages: 5,
      summaryNotes: 3,
      detailedNotes: 2,
      bulletNotes: 3,
      pdfExports: 0, // Free plan doesn't have PDF export
    },
    pro: {
      aiMessages: 500,
      summaryNotes: 100,
      detailedNotes: 100,
      bulletNotes: 100,
      pdfExports: 50, // Reasonable daily limit for pro
    },
    premium: {
      aiMessages: 1000,
      summaryNotes: -1, // Unlimited
      detailedNotes: -1, // Unlimited
      bulletNotes: -1, // Unlimited
      pdfExports: -1, // Unlimited
    },
  };

  useEffect(() => {
    fetchSubscriptionDetails();
    
    // Set up real-time listener for usage data
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser) {
      setLoading(false);
      return;
    }

    // Listen to real-time usage updates from the CORRECT collection
    const today = new Date().toISOString().split('T')[0];
    const usageDocId = `${currentUser.uid}_${today}`;
    
    console.log('📊 Setting up usage listener for:', usageDocId);
    
    const unsubscribe = firestore()
      .collection('daily_usage')
      .doc(usageDocId)
      .onSnapshot(
        (doc) => {
          if (doc.exists) {
            const data = doc.data();
            console.log('Real-time usage data:', data);
            setUsage({
              aiMessages: data?.aiMessages || 0,
              summaryNotes: data?.summaryNotes || 0,
              detailedNotes: data?.detailedNotes || 0,
              bulletNotes: data?.bulletNotes || 0,
              pdfExports: data?.pdfExports || 0,
            });
          } else {
            console.log('No usage document found, initializing with zeros');
            // Initialize with zero values if document doesn't exist
            setUsage({
              aiMessages: 0,
              summaryNotes: 0,
              detailedNotes: 0,
              bulletNotes: 0,
              pdfExports: 0,
            });
          }
          setLoading(false);
        },
        (error) => {
          console.error('Error listening to usage data:', error);
          setLoading(false);
        }
      );

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  const fetchSubscriptionDetails = async () => {
    try {
      const currentUser = AuthService.getCurrentUser();
      if (currentUser) {
        const userDoc = await firestore()
          .collection('users')
          .doc(currentUser.uid)
          .get();

        if (userDoc.exists) {
          const userData = userDoc.data();
          if (userData?.subscription?.endDate) {
            setSubscriptionEndDate(userData.subscription.endDate.toDate());
          }
        }
      }
    } catch (error) {
      console.error('Error fetching subscription details:', error);
    }
  };


  const getLimit = (feature: keyof typeof usage) => {
    // Parse plan name to get the base plan type
    let currentPlan: 'free' | 'pro' | 'premium' = 'free';
    
    if (plan?.includes('premium-')) {
      currentPlan = 'premium';
    } else if (plan?.includes('pro-')) {
      currentPlan = 'pro';
    } else if (plan === 'premium') {
      currentPlan = 'premium';
    } else if (plan === 'pro') {
      currentPlan = 'pro';
    }
    
    console.log('Plan detection:', { plan, currentPlan, isActive });
    
    return limits[currentPlan][feature];
  };

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0;
    return Math.min((used / limit) * 100, 100);
  };

  const UsageItem = ({
    icon,
    title,
    used,
    limit,
  }: {
    icon: string;
    title: string;
    used: number;
    limit: number;
  }) => {
    const percentage = getUsagePercentage(used, limit);
    const isUnlimited = limit === -1;
    const remainingUsage = isUnlimited ? 0 : Math.max(0, limit - used);
    const isExhausted = !isUnlimited && used >= limit;

    // Get color based on usage percentage
    const getProgressColor = () => {
      if (isExhausted) return '#FF5252';
      if (percentage > 80) return '#FF9800';
      if (percentage > 60) return '#FFC107';
      if (plan === 'premium') return '#FFD700';
      if (plan === 'pro') return '#9C27B0';
      return isDarkMode ? '#BB86FC' : '#6200EE';
    };

    const getIconColor = () => {
      if (isExhausted) return '#FF5252';
      if (plan === 'premium') return '#FFD700';
      if (plan === 'pro') return '#9C27B0';
      return isDarkMode ? '#BB86FC' : '#6200EE';
    };

    return (
      <Card style={[styles.usageCard, isExhausted && styles.exhaustedCard]}>
        <View style={styles.usageHeader}>
          <View style={[styles.iconContainer, { backgroundColor: `${getIconColor()}15` }]}>
            <MaterialIcon
              name={icon}
              size={24}
              color={getIconColor()}
            />
          </View>
          <View style={styles.usageTitleContainer}>
            <Text style={[styles.usageTitle, isDarkMode && styles.textDark]}>
              {title}
            </Text>
            {isUnlimited ? (
              <View style={styles.unlimitedBadge}>
                <MaterialIcon name="all-inclusive" size={14} color="#FFD700" />
                <Text style={styles.unlimitedText}>Unlimited</Text>
              </View>
            ) : isExhausted ? (
              <Text style={styles.exhaustedText}>Limit Reached</Text>
            ) : (
              <Text style={[styles.remainingText, isDarkMode && styles.textDark]}>
                {remainingUsage} remaining
              </Text>
            )}
          </View>
        </View>
        
        <View style={styles.usageStats}>
          <View style={styles.usageNumbers}>
            <Text style={[styles.usedNumber, isDarkMode && styles.textDark]}>
              {used}
            </Text>
            {!isUnlimited && (
              <>
                <Text style={[styles.divider, isDarkMode && styles.textDark]}>
                  /
                </Text>
                <Text style={[styles.limitNumber, isDarkMode && styles.textDark]}>
                  {limit}
                </Text>
              </>
            )}
          </View>
          {!isUnlimited && (
            <View style={[styles.percentageBadge, { backgroundColor: `${getProgressColor()}15` }]}>
              <Text style={[styles.percentageText, { color: getProgressColor() }]}>
                {percentage.toFixed(0)}%
              </Text>
            </View>
          )}
        </View>
        
        {!isUnlimited && (
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, isDarkMode && styles.progressBarDark]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${percentage}%`,
                    backgroundColor: getProgressColor(),
                  },
                ]}
              />
            </View>
          </View>
        )}
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, isDarkMode && styles.containerDark]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={isDarkMode ? '#BB86FC' : '#6200EE'}
          />
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, isDarkMode && styles.containerDark]}
      contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <MaterialIcon
            name="arrow-back"
            size={24}
            color={isDarkMode ? '#FFFFFF' : '#000000'}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDarkMode && styles.textDark]}>
          Daily Usage
        </Text>
      </View>

      <Card style={[styles.planCard, 
        plan === 'premium' && styles.premiumCard,
        plan === 'pro' && styles.proCard]}>
        <View style={styles.planGradient}>
          <Text style={[styles.planLabel, 
            (plan === 'premium' || plan === 'pro') && styles.planLabelPremium]}>
            CURRENT PLAN
          </Text>
          <Text style={[styles.planName, 
            (plan?.includes('premium') || plan?.includes('pro')) && styles.planNamePremium]}>
            {plan?.includes('premium') ? 'Premium' : 
             plan?.includes('pro') ? 'Pro' : 
             plan === 'premium' ? 'Premium' :
             plan === 'pro' ? 'Pro' : 'Free'}
          </Text>
          
          {isActive && subscriptionEndDate && (
            <Text style={[styles.planExpiry, 
              (plan === 'premium' || plan === 'pro') && styles.planExpiryPremium]}>
              Valid until {subscriptionEndDate.toLocaleDateString()}
            </Text>
          )}
          
          {(plan?.includes('premium') || plan === 'premium') && (
            <View style={styles.premiumFeatures}>
              <View style={styles.featureRow}>
                <MaterialIcon name="all-inclusive" size={16} color="#FFD700" />
                <Text style={styles.featureText}>1000 AI Messages + Unlimited Notes</Text>
              </View>
            </View>
          )}
          
          {(plan?.includes('pro') || plan === 'pro') && !(plan?.includes('premium')) && (
            <View style={styles.proFeatures}>
              <View style={styles.featureRow}>
                <MaterialIcon name="star" size={16} color="#9C27B0" />
                <Text style={styles.featureText}>500 AI Messages + 100 Notes Each</Text>
              </View>
            </View>
          )}
          
          {!plan?.includes('premium') && !plan?.includes('pro') && plan !== 'premium' && plan !== 'pro' && (
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={() => navigation.navigate('Upgrade')}>
              <MaterialIcon name="rocket-launch" size={18} color="#FFFFFF" />
              <Text style={styles.upgradeText}>Upgrade to Premium</Text>
            </TouchableOpacity>
          )}
        </View>
      </Card>

      <UsageItem
        icon="chat"
        title="AI Messages"
        used={usage.aiMessages}
        limit={getLimit('aiMessages')}
      />

      <UsageItem
        icon="summarize"
        title="Summary Notes"
        used={usage.summaryNotes}
        limit={getLimit('summaryNotes')}
      />

      <UsageItem
        icon="description"
        title="Detailed Notes"
        used={usage.detailedNotes}
        limit={getLimit('detailedNotes')}
      />

      <UsageItem
        icon="format-list-bulleted"
        title="Bullet Notes"
        used={usage.bulletNotes}
        limit={getLimit('bulletNotes')}
      />

      <UsageItem
        icon="picture-as-pdf"
        title="PDF Exports"
        used={usage.pdfExports}
        limit={getLimit('pdfExports')}
      />

      <Card style={styles.infoCard}>
        <MaterialIcon
          name="info"
          size={20}
          color={isDarkMode ? '#BB86FC' : '#6200EE'}
        />
        <Text style={[styles.infoText, isDarkMode && styles.textDark]}>
          Usage limits reset daily at midnight
        </Text>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  contentContainer: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
  },
  backButton: {
    marginRight: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  textDark: {
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planCard: {
    margin: 20,
    marginTop: 10,
    padding: 0,
    overflow: 'hidden',
  },
  premiumCard: {
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  proCard: {
    borderWidth: 2,
    borderColor: '#9C27B0',
  },
  planGradient: {
    padding: 25,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  planLabel: {
    fontSize: 12,
    letterSpacing: 1.5,
    fontWeight: '700',
    color: '#999999',
    marginBottom: 8,
  },
  planLabelPremium: {
    color: '#666666',
  },
  planName: {
    fontSize: 32,
    fontWeight: '900',
    color: '#000000',
    marginBottom: 8,
  },
  planNamePremium: {
    color: '#000000',
  },
  planExpiry: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 20,
  },
  planExpiryPremium: {
    color: '#666666',
  },
  premiumFeatures: {
    marginTop: 15,
  },
  proFeatures: {
    marginTop: 15,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  featureText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    backgroundColor: '#6200EE',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 20,
    elevation: 3,
    shadowColor: '#6200EE',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  upgradeText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
    marginLeft: 6,
  },
  usageCard: {
    margin: 20,
    marginTop: 0,
    marginBottom: 12,
    padding: 16,
  },
  exhaustedCard: {
    borderWidth: 1,
    borderColor: '#FF525230',
  },
  usageHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  usageTitleContainer: {
    flex: 1,
    marginLeft: 10,
  },
  usageTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  remainingText: {
    fontSize: 11,
    color: '#666666',
  },
  exhaustedText: {
    fontSize: 11,
    color: '#FF5252',
    fontWeight: '600',
  },
  unlimitedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
  },
  unlimitedText: {
    fontSize: 11,
    color: '#FFD700',
    fontWeight: '600',
    marginLeft: 3,
  },
  usageStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  usageNumbers: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  usedNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#000000',
  },
  divider: {
    fontSize: 16,
    color: '#999999',
    marginHorizontal: 4,
  },
  limitNumber: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666666',
  },
  percentageBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  percentageText: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressContainer: {
    marginTop: 2,
  },
  progressBar: {
    height: 7,
    backgroundColor: '#E8E8E8',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarDark: {
    backgroundColor: '#333333',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  infoCard: {
    margin: 20,
    marginTop: 0,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 10,
    flex: 1,
  },
});

export default DailyUsageScreen;