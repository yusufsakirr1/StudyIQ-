import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import firestore from '@react-native-firebase/firestore';
import { AuthService } from '../services/firebaseAuthService';
import { IAPService, SubscriptionPlan } from '../services/iapService';

interface SubscriptionContextType {
  isActive: boolean;
  plan: string;
  subscriptionPlans: SubscriptionPlan[];
  loading: boolean;
  iapAvailable: boolean;
  purchaseSubscription: (productId: string) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

interface SubscriptionProviderProps {
  children: ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const [isActive, setIsActive] = useState(false);
  const [plan, setPlan] = useState('free');
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [iapAvailable, setIapAvailable] = useState(false);

  // Kullanıcının plan bilgisini al
  const fetchUserSubscription = async (userId: string) => {
    try {
      const userDoc = await firestore().collection('users').doc(userId).get();
      
      if (userDoc.exists) {
        const userData = userDoc.data();
        console.log('📦 User data from Firestore:', userData);
        
        // Plan bilgisini kontrol et
        const userPlan = userData?.subscription?.plan;
        const userIsActive = userData?.subscription?.isActive;
        
        console.log('🔍 Subscription details:', { plan: userPlan, isActive: userIsActive });
        
        if (userPlan && userIsActive) {
          setPlan(userPlan);
          setIsActive(true);
        } else {
          console.log('⚠️ Invalid subscription data:', { userPlan, userIsActive });
          setPlan('free');
          setIsActive(false);
        }
      } else {
        console.log('📄 User document does not exist');
        setPlan('free');
        setIsActive(false);
      }
    } catch (error) {
      console.error('❌ Error fetching user subscription:', error);
      // Firestore permission hatası durumunda free plan'de devam et
      if (error.code === 'permission-denied') {
        console.warn('🔒 Firestore permission denied, defaulting to free plan');
      }
      setPlan('free');
      setIsActive(false);
    }
  };

  // Real-time Firestore listener for user subscription
  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (!user) {
      setIsActive(false);
      setPlan('free');
      setLoading(false);
      return;
    }

    console.log('🔄 Setting up real-time subscription listener for user:', user.uid);

    // İlk yükleme için plan bilgisini al
    fetchUserSubscription(user.uid);

    // Real-time listener for user's subscription document
    const unsubscribe = firestore()
      .collection('users')
      .doc(user.uid)
      .onSnapshot(
        async (doc) => {
          try {
            if (doc.exists) {
              const userData = doc.data();
              console.log('📦 Real-time update - User data:', userData);
              
              // Plan bilgisini kontrol et
              const userPlan = userData?.subscription?.plan;
              const userIsActive = userData?.subscription?.isActive;
              
              console.log('🔄 Real-time subscription update:', { plan: userPlan, isActive: userIsActive });
              
              if (userPlan && userIsActive) {
                setPlan(userPlan);
                setIsActive(true);
              } else {
                console.log('⚠️ Invalid subscription data in real-time update:', { userPlan, userIsActive });
                setPlan('free');
                setIsActive(false);
              }
            } else {
              console.log('📄 User document does not exist in real-time update');
              setPlan('free');
              setIsActive(false);
            }
          } catch (error) {
            console.error('❌ Error processing subscription update:', error);
            setPlan('free');
            setIsActive(false);
          } finally {
            setLoading(false);
          }
        },
        (error) => {
          console.error('❌ Firestore subscription listener error:', error);
          // Firestore permission hatası durumunda sessizce free plan'e geç
          if (error.code === 'permission-denied') {
            console.warn('🔒 Firestore permission denied, continuing with free plan');
          }
          setPlan('free');
          setIsActive(false);
          setLoading(false);
        }
      );

    return () => {
      console.log('🔄 Cleaning up subscription listener');
      unsubscribe();
    };
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChanged((user) => {
      if (!user) {
        setIsActive(false);
        setPlan('free');
        setLoading(false);
      } else {
        // Kullanıcı giriş yaptığında plan bilgisini yeniden al
        fetchUserSubscription(user.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  // Initialize IAP
  useEffect(() => {
    initializeIAP();
  }, []);

  const initializeIAP = async () => {
    try {
      const initialized = await IAPService.initialize();
      setIapAvailable(initialized);
      
      if (initialized) {
        const plans = await IAPService.getSubscriptionPlans();
        setSubscriptionPlans(plans);
        console.log('✅ IAP initialized with plans:', plans);
      } else {
        console.warn('⚠️ IAP not available, continuing in free mode');
      }
    } catch (error) {
      console.error('❌ IAP initialization failed:', error);
      setIapAvailable(false);
      // Firestore permission hatası durumunda sessizce devam et
      if (error.message?.includes('permission-denied')) {
        console.warn('🔒 Firestore permission denied, continuing in offline mode');
      }
    }
  };

  const purchaseSubscription = async (productId: string): Promise<boolean> => {
    try {
      if (!iapAvailable) {
        throw new Error('IAP not available');
      }
      
      console.log('🛒 Starting purchase for:', productId);
      const success = await IAPService.purchaseSubscription(productId);
      
      if (success) {
        console.log('✅ Purchase successful, subscription will be updated via real-time listener');
        // Başarılı satın alma sonrası plan bilgisini hemen güncelle
        const user = AuthService.getCurrentUser();
        if (user) {
          await fetchUserSubscription(user.uid);
        }
      }
      
      return success;
    } catch (error) {
      console.error('❌ Purchase failed:', error);
      throw error;
    }
  };

  const restorePurchases = async (): Promise<boolean> => {
    try {
      if (!iapAvailable) {
        return false;
      }
      
      console.log('🔄 Restoring purchases...');
      const restored = await IAPService.restorePurchases();
      
      if (restored) {
        console.log('✅ Purchases restored, subscription will be updated via real-time listener');
        // Başarılı geri yükleme sonrası plan bilgisini hemen güncelle
        const user = AuthService.getCurrentUser();
        if (user) {
          await fetchUserSubscription(user.uid);
        }
      }
      
      return restored;
    } catch (error) {
      console.error('❌ Restore failed:', error);
      return false;
    }
  };

  const refreshSubscription = async (): Promise<void> => {
    const user = AuthService.getCurrentUser();
    if (user) {
      console.log('🔄 Manually refreshing subscription data');
      await fetchUserSubscription(user.uid);
    }
  };

  const value: SubscriptionContextType = {
    isActive,
    plan,
    subscriptionPlans,
    loading,
    iapAvailable,
    purchaseSubscription,
    restorePurchases,
    refreshSubscription,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};