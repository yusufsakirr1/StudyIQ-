import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import MaterialIcon from '@react-native-vector-icons/material-icons';
import { useSubscription } from '../contexts/SubscriptionContext';
import { SUBSCRIPTION_SKUS } from '../services/iapService';
import { useDarkMode } from '../contexts/DarkModeContext';

const UpgradeScreen = ({navigation}: any) => {
  const { isDarkMode } = useDarkMode();
  const { 
    subscriptionPlans, 
    purchaseSubscription, 
    restorePurchases,
    refreshSubscription,
    loading,
    isActive,
    plan 
  } = useSubscription();

  // Component mount olduğunda ve plan değiştiğinde bilgileri güncelle
  useEffect(() => {
    const updatePlanSelection = () => {
      console.log('🔄 Plan changed:', plan);
      
      // Plan değiştiğinde seçili planı güncelle
      if (plan?.includes('pro-')) {
        setSelectedPlan('pro');
      } else if (plan?.includes('premium-')) {
        setSelectedPlan('premium');
      }
      
      // Fatura dönemini güncelle
      if (plan?.includes('-yearly')) {
        setBillingPeriod('yearly');
      } else if (plan?.includes('-monthly')) {
        setBillingPeriod('monthly');
      }
    };

    updatePlanSelection();
  }, [plan]);
  // Fatura dönemini kullanıcının mevcut planına göre ayarla
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>(() => {
    if (plan?.includes('-yearly')) return 'yearly';
    return 'monthly';
  });
  // Plan seçimini kullanıcının mevcut planına göre ayarla
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'premium'>(() => {
    if (plan?.includes('premium-')) return 'premium';
    return 'pro';
  });
  const [purchasing, setPurchasing] = useState(false);

  const goBack = () => {
    navigation.goBack();
  };

  const handlePlanSelection = async (productId: string) => {
    try {
      setPurchasing(true);
      console.log('🛒 Starting purchase for:', productId);
      
      const success = await purchaseSubscription(productId);
      
      if (success) {
        // Plan değişikliğini bekle
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Plan değişikliğini kontrol et
        await refreshSubscription();
        
        Alert.alert(
          'Purchase Successful!',
          'Your subscription has been activated. Enjoy premium features!',
          [
            {
              text: 'OK',
              onPress: () => {
                // UpgradeScreen'de kalarak güncel planı göster
                console.log('✅ Purchase completed, staying on UpgradeScreen');
              },
            },
          ]
        );
      } else {
        Alert.alert('Purchase Failed', 'Something went wrong. Please try again.');
      }
    } catch (error: any) {
      console.error('❌ Purchase error:', error);
      Alert.alert('Purchase Error', error.message || 'Failed to purchase subscription');
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestorePurchases = async () => {
    try {
      setPurchasing(true);
      const success = await restorePurchases();
      
      if (success) {
        Alert.alert('Success', 'Purchases restored successfully!');
      } else {
        Alert.alert('No Purchases', 'No previous purchases found to restore.');
      }
    } catch (error) {
      Alert.alert('Restore Failed', 'Failed to restore purchases. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  const getPlanPrice = (planType: 'pro' | 'premium', period: 'monthly' | 'yearly') => {
    let productId;
    if (planType === 'pro') {
      productId = period === 'monthly' ? SUBSCRIPTION_SKUS.PRO_MONTHLY : SUBSCRIPTION_SKUS.PRO_YEARLY;
    } else {
      productId = period === 'monthly' ? SUBSCRIPTION_SKUS.PREMIUM_MONTHLY : SUBSCRIPTION_SKUS.PREMIUM_YEARLY;
    }
    
    const planData = subscriptionPlans.find(p => p.productId === productId);
    if (planData) return planData.price;
    
    // Fallback prices
    if (planType === 'pro') {
      return period === 'monthly' ? '$2.99' : '$29.90';
    } else {
      return period === 'monthly' ? '$4.99' : '$49.90';
    }
  };

  const getCurrentProductId = () => {
    if (selectedPlan === 'pro') {
      return billingPeriod === 'monthly' ? SUBSCRIPTION_SKUS.PRO_MONTHLY : SUBSCRIPTION_SKUS.PRO_YEARLY;
    } else {
      return billingPeriod === 'monthly' ? SUBSCRIPTION_SKUS.PREMIUM_MONTHLY : SUBSCRIPTION_SKUS.PREMIUM_YEARLY;
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, isDarkMode && styles.darkContainer]}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={[styles.loadingText, isDarkMode && styles.darkText]}>
          Loading subscription plans...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      {/* Header */}
      <View style={[styles.header, isDarkMode && styles.darkHeader]}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <MaterialIcon 
            name="arrow-back" 
            size={24} 
            color={isDarkMode ? '#ffffff' : '#1f2937'} 
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDarkMode && styles.darkText]}>
          Upgrade to Premium
        </Text>
        <View style={styles.restoreButton} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

        {/* Billing Period Toggle */}
        <View style={[styles.toggleContainer, isDarkMode && styles.darkCard]}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              billingPeriod === 'monthly' && styles.activeToggle,
              isDarkMode && billingPeriod === 'monthly' && styles.darkActiveToggle,
            ]}
            onPress={() => setBillingPeriod('monthly')}>
            <Text style={[
              styles.toggleText,
              billingPeriod === 'monthly' && styles.activeToggleText,
              isDarkMode && styles.darkText,
            ]}>
              Monthly
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              billingPeriod === 'yearly' && styles.activeToggle,
              isDarkMode && billingPeriod === 'yearly' && styles.darkActiveToggle,
            ]}
            onPress={() => setBillingPeriod('yearly')}>
            <Text style={[
              styles.toggleText,
              billingPeriod === 'yearly' && styles.activeToggleText,
              isDarkMode && styles.darkText,
            ]}>
              Yearly
            </Text>
            <View style={styles.saveBadge}>
              <Text style={styles.saveText}>Save 17%</Text>
            </View>
          </TouchableOpacity>
        </View>


        {/* Pro Plan */}
        <View style={[styles.planCard, (plan?.includes('pro-')) ? styles.currentPlanCard : styles.proCard, isDarkMode && styles.darkCard]}>
            <View style={styles.planHeader}>
              <MaterialIcon name="star" size={32} color="#3b82f6" />
              <View style={styles.planInfo}>
                <Text style={[styles.planTitle, isDarkMode && styles.darkText]}>
                  Pro Plan
                </Text>
                <Text style={[styles.planPrice, isDarkMode && styles.darkText]}>
                  {getPlanPrice('pro', billingPeriod)}
                  <Text style={[styles.planPeriod, isDarkMode && styles.darkSubtitle]}>
                    /{billingPeriod === 'monthly' ? 'month' : 'year'}
                  </Text>
                </Text>
              </View>
            </View>

            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <MaterialIcon name="check" size={20} color="#10b981" />
                <Text style={[styles.featureText, isDarkMode && styles.darkText]}>
                  AI Messages: 500/day
                </Text>
              </View>
              <View style={styles.featureItem}>
                <MaterialIcon name="check" size={20} color="#10b981" />
                <Text style={[styles.featureText, isDarkMode && styles.darkText]}>
                  Export PDF ✅
                </Text>
              </View>
              <View style={styles.featureItem}>
                <MaterialIcon name="check" size={20} color="#10b981" />
                <Text style={[styles.featureText, isDarkMode && styles.darkText]}>
                  Summary Notes: 100/day
                </Text>
              </View>
              <View style={styles.featureItem}>
                <MaterialIcon name="check" size={20} color="#10b981" />
                <Text style={[styles.featureText, isDarkMode && styles.darkText]}>
                  Detailed Notes: 100/day
                </Text>
              </View>
              <View style={styles.featureItem}>
                <MaterialIcon name="check" size={20} color="#10b981" />
                <Text style={[styles.featureText, isDarkMode && styles.darkText]}>
                  Bullet Notes: 100/day
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.subscribeButton,
                (plan?.includes('pro-')) && styles.currentPlanButton,
                purchasing && styles.disabledButton,
              ]}
              onPress={() => (!plan?.includes('pro-')) ? handlePlanSelection(billingPeriod === 'monthly' ? SUBSCRIPTION_SKUS.PRO_MONTHLY : SUBSCRIPTION_SKUS.PRO_YEARLY) : null}
              disabled={purchasing || (plan?.includes('pro-'))}>
              {purchasing ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={[
                  styles.subscribeButtonText,
                  (plan?.includes('pro-')) && styles.currentPlanButtonText
                ]}>
                  {(plan?.includes('pro-')) ? `Current Plan (${plan?.includes('-yearly') ? 'Yearly' : 'Monthly'})` : 'Upgrade to Pro'}
                </Text>
              )}
            </TouchableOpacity>
        </View>

        {/* Premium Plan */}
          <View style={[styles.planCard, (plan?.includes('premium-')) ? styles.currentPlanCard : styles.premiumCard, isDarkMode && styles.darkCard]}>
            <View style={styles.planHeader}>
              <MaterialIcon name="diamond" size={32} color="#f59e0b" />
              <View style={styles.planInfo}>
                <Text style={[styles.planTitle, isDarkMode && styles.darkText]}>
                  Premium Plan
                </Text>
                <Text style={[styles.planPrice, isDarkMode && styles.darkText]}>
                  {getPlanPrice('premium', billingPeriod)}
                  <Text style={[styles.planPeriod, isDarkMode && styles.darkSubtitle]}>
                    /{billingPeriod === 'monthly' ? 'month' : 'year'}
                  </Text>
                </Text>
              </View>
            </View>

            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <MaterialIcon name="check" size={20} color="#10b981" />
                <Text style={[styles.featureText, isDarkMode && styles.darkText]}>
                  AI Messages: 1000/day
                </Text>
              </View>
              <View style={styles.featureItem}>
                <MaterialIcon name="check" size={20} color="#10b981" />
                <Text style={[styles.featureText, isDarkMode && styles.darkText]}>
                  Export PDF ✅
                </Text>
              </View>
              <View style={styles.featureItem}>
                <MaterialIcon name="check" size={20} color="#10b981" />
                <Text style={[styles.featureText, isDarkMode && styles.darkText]}>
                  Summary Notes: Unlimited
                </Text>
              </View>
              <View style={styles.featureItem}>
                <MaterialIcon name="check" size={20} color="#10b981" />
                <Text style={[styles.featureText, isDarkMode && styles.darkText]}>
                  Detailed Notes: Unlimited
                </Text>
              </View>
              <View style={styles.featureItem}>
                <MaterialIcon name="check" size={20} color="#10b981" />
                <Text style={[styles.featureText, isDarkMode && styles.darkText]}>
                  Bullet Notes: Unlimited
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.subscribeButton,
                (plan?.includes('premium-')) && styles.currentPlanButton,
                purchasing && styles.disabledButton,
              ]}
              onPress={() => (!plan?.includes('premium-')) ? handlePlanSelection(billingPeriod === 'monthly' ? SUBSCRIPTION_SKUS.PREMIUM_MONTHLY : SUBSCRIPTION_SKUS.PREMIUM_YEARLY) : null}
              disabled={purchasing || (plan?.includes('premium-'))}>
              {purchasing ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={[
                  styles.subscribeButtonText,
                  (plan?.includes('premium-')) && styles.currentPlanButtonText
                ]}>
                  {(plan?.includes('premium-')) ? `Current Plan (${billingPeriod === 'monthly' ? 'Monthly' : 'Yearly'})` : 'Upgrade to Premium'}
                </Text>
              )}
            </TouchableOpacity>
        </View>

        {/* Free Plan */}
        <View style={[styles.planCard, isDarkMode && styles.darkCard]}>
          <View style={styles.planHeader}>
            <MaterialIcon name="workspace-premium" size={32} color="#cd7f32" />
            <View style={styles.planInfo}>
              <Text style={[styles.planTitle, isDarkMode && styles.darkText]}>
                Free Plan
              </Text>
              <Text style={[styles.planPrice, isDarkMode && styles.darkText]}>
                $0<Text style={[styles.planPeriod, isDarkMode && styles.darkSubtitle]}>/forever</Text>
              </Text>
            </View>
          </View>

          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <MaterialIcon name="check" size={20} color="#10b981" />
              <Text style={[styles.featureText, isDarkMode && styles.darkText]}>
                AI Messages: 5/day
              </Text>
            </View>
            <View style={styles.featureItem}>
              <MaterialIcon name="close" size={20} color="#ef4444" />
              <Text style={[styles.featureText, styles.disabledFeature, isDarkMode && styles.darkSubtitle]}>
                Export PDF ❌
              </Text>
            </View>
            <View style={styles.featureItem}>
              <MaterialIcon name="check" size={20} color="#10b981" />
              <Text style={[styles.featureText, isDarkMode && styles.darkText]}>
                Summary Notes: 3/day
              </Text>
            </View>
            <View style={styles.featureItem}>
              <MaterialIcon name="check" size={20} color="#10b981" />
              <Text style={[styles.featureText, isDarkMode && styles.darkText]}>
                Detailed Notes: 2/day
              </Text>
            </View>
            <View style={styles.featureItem}>
              <MaterialIcon name="check" size={20} color="#10b981" />
              <Text style={[styles.featureText, isDarkMode && styles.darkText]}>
                Bullet Notes: 3/day
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.freeButton, 
              isDarkMode && styles.darkFreeButton,
              (plan === 'free' || !plan) && styles.currentPlanButton
            ]}
            onPress={!plan || plan === 'free' ? undefined : goBack}
            disabled={!plan || plan === 'free'}>
            <Text style={[
              styles.freeButtonText, 
              isDarkMode && styles.darkText,
              (plan === 'free' || !plan) && styles.currentPlanButtonText
            ]}>
              {(!plan || plan === 'free') ? 'Current Plan (Free)' : 'Continue with Free'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Terms */}
        <Text style={[styles.termsText, isDarkMode && styles.darkSubtitle]}>
          Subscription automatically renews unless auto-renew is turned off at least 24 hours before the end of the current period. You can manage your subscription in your device settings.
        </Text>
      </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  darkHeader: {
    backgroundColor: '#1f2937',
    borderBottomColor: '#374151',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  restoreButton: {
    padding: 8,
  },
  restoreText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  statusText: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  planToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  planToggleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    position: 'relative',
  },
  activeToggle: {
    backgroundColor: '#3b82f6',
  },
  darkActiveToggle: {
    backgroundColor: '#2563eb',
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeToggleText: {
    color: '#ffffff',
  },
  saveBadge: {
    position: 'absolute',
    top: -8,
    right: 8,
    backgroundColor: '#10b981',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  saveText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  planCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  proCard: {
    borderColor: '#3b82f6',
  },
  premiumCard: {
    borderColor: '#f59e0b',
  },
  currentPlanCard: {
    borderColor: '#10b981',
    backgroundColor: '#f0fdf4',
  },
  darkCard: {
    backgroundColor: '#1f2937',
    borderColor: '#374151',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  planInfo: {
    flex: 1,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  planPeriod: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: 'normal',
  },
  featuresList: {
    gap: 12,
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#374151',
  },
  disabledFeature: {
    textDecorationLine: 'line-through',
  },
  subscribeButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
  },
  subscribeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  currentPlanButton: {
    backgroundColor: '#10b981',
  },
  currentPlanButtonText: {
    color: '#ffffff',
  },
  freeButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  darkFreeButton: {
    backgroundColor: '#374151',
  },
  freeButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  termsText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 16,
  },
  darkText: {
    color: '#ffffff',
  },
  darkSubtitle: {
    color: '#9ca3af',
  },
});

export default UpgradeScreen;