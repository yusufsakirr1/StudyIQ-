import firestore from '@react-native-firebase/firestore';
import { AuthService } from './firebaseAuthService';

export type SubscriptionType = 'free' | 'pro-monthly' | 'pro-yearly' | 'premium-monthly' | 'premium-yearly';

export interface UserSubscription {
  plan: SubscriptionType;
  isActive: boolean;
  updatedAt: Date;
}

export interface UsageData {
  aiMessages: number;
  summaryNotes: number;
  detailedNotes: number;
  bulletNotes: number;
  pdfExports: number;
}

export interface PlanLimits {
  aiMessages: number;
  summaryNotes: number;
  detailedNotes: number;
  bulletNotes: number;
  pdfExports: number;
}

class SubscriptionServiceClass {
  // Plan limitleri - sabit değerler
  private readonly PLAN_LIMITS: Record<SubscriptionType, PlanLimits> = {
    free: {
      aiMessages: 5,
      summaryNotes: 3,
      detailedNotes: 2,
      bulletNotes: 3,
      pdfExports: 1,
    },
    'pro-monthly': {
      aiMessages: 500,
      summaryNotes: 100,
      detailedNotes: 100,
      bulletNotes: 100,
      pdfExports: 20,
    },
    'pro-yearly': {
      aiMessages: 500,
      summaryNotes: 100,
      detailedNotes: 100,
      bulletNotes: 100,
      pdfExports: 20,
    },
    'premium-monthly': {
      aiMessages: 1000,
      summaryNotes: -1, // unlimited
      detailedNotes: -1, // unlimited
      bulletNotes: -1, // unlimited
      pdfExports: -1, // unlimited
    },
    'premium-yearly': {
      aiMessages: 1000,
      summaryNotes: -1, // unlimited
      detailedNotes: -1, // unlimited
      bulletNotes: -1, // unlimited
      pdfExports: -1, // unlimited
    },
  };

  /**
   * Kullanıcının gerçek zamanlı subscription bilgilerini al
   */
  getUserSubscription(): Promise<UserSubscription> {
    return new Promise((resolve, reject) => {
      const user = AuthService.getCurrentUser();
      if (!user) {
        resolve({ plan: 'free', isActive: false, updatedAt: new Date() });
        return;
      }

      // Önce users koleksiyonunu kontrol et
      const unsubscribe = firestore()
        .collection('users')
        .doc(user.uid)
        .onSnapshot(
          (doc) => {
            try {
              if (doc.exists) {
                const userData = doc.data();
                const subscription = userData?.subscription;
                
                if (subscription && subscription.plan && subscription.isActive) {
                  resolve({
                    plan: subscription.plan as SubscriptionType,
                    isActive: subscription.isActive,
                    updatedAt: subscription.updatedAt?.toDate() || new Date(),
                  });
                  unsubscribe(); // Tek seferlik okuma için
                  return;
                }
              }
              
              // Subscription bulunamadı, free plan dön
              resolve({ plan: 'free', isActive: false, updatedAt: new Date() });
              unsubscribe();
            } catch (error) {
              console.error('❌ Error getting subscription:', error);
              // Firestore permission hatası durumunda sessizce free plan dön
              if (error.code === 'permission-denied') {
                console.warn('🔒 Firestore permission denied, defaulting to free plan');
              }
              resolve({ plan: 'free', isActive: false, updatedAt: new Date() });
              unsubscribe();
            }
          },
          (error) => {
            console.error('❌ Firestore listener error:', error);
            // Firestore permission hatası durumunda sessizce free plan dön
            if (error.code === 'permission-denied') {
              console.warn('🔒 Firestore permission denied, defaulting to free plan');
            }
            resolve({ plan: 'free', isActive: false, updatedAt: new Date() });
          }
        );
    });
  }

  /**
   * Kullanıcının gerçek zamanlı subscription dinleyicisi
   */
  subscribeToUserSubscription(callback: (subscription: UserSubscription) => void): () => void {
    const user = AuthService.getCurrentUser();
    if (!user) {
      callback({ plan: 'free', isActive: false, updatedAt: new Date() });
      return () => {};
    }

    console.log('🔄 Setting up subscription listener for:', user.uid);

    return firestore()
      .collection('users')
      .doc(user.uid)
      .onSnapshot(
        (doc) => {
          try {
            if (doc.exists) {
              const userData = doc.data();
              const subscription = userData?.subscription;
              
              console.log('📦 Subscription data update:', subscription);
              
              if (subscription && subscription.plan) {
                callback({
                  plan: subscription.plan as SubscriptionType,
                  isActive: subscription.isActive || false,
                  updatedAt: subscription.updatedAt?.toDate() || new Date(),
                });
              } else {
                callback({ plan: 'free', isActive: false, updatedAt: new Date() });
              }
            } else {
              callback({ plan: 'free', isActive: false, updatedAt: new Date() });
            }
          } catch (error) {
            console.error('❌ Error processing subscription update:', error);
            callback({ plan: 'free', isActive: false, updatedAt: new Date() });
          }
        },
        (error) => {
          console.error('❌ Subscription listener error:', error);
          // Firestore permission hatası durumunda sessizce free plan dön
          if (error.code === 'permission-denied') {
            console.warn('🔒 Firestore permission denied, continuing with free plan');
          }
          callback({ plan: 'free', isActive: false, updatedAt: new Date() });
        }
      );
  }

  /**
   * Plan limitlerini al
   */
  getPlanLimits(plan: SubscriptionType): PlanLimits {
    return this.PLAN_LIMITS[plan] || this.PLAN_LIMITS.free;
  }

  /**
   * Kullanıcının günlük kullanımını al
   */
  async getTodayUsage(): Promise<UsageData> {
    const defaultUsage = {
      aiMessages: 0,
      summaryNotes: 0,
      detailedNotes: 0,
      bulletNotes: 0,
      pdfExports: 0
    };

    const user = AuthService.getCurrentUser();
    if (!user) {
      return defaultUsage;
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      const usageRef = firestore()
        .collection('daily_usage')
        .doc(`${user.uid}_${today}`);

      // Önce dökümanı oluştur
      await usageRef.set({
        userId: user.uid,
        date: today,
        ...defaultUsage,
        createdAt: firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      // Sonra dökümanı oku
      const usageDoc = await usageRef.get();
      if (!usageDoc.exists) {
        return defaultUsage;
      }

      const data = usageDoc.data();
      return {
        aiMessages: data?.aiMessages || 0,
        summaryNotes: data?.summaryNotes || 0,
        detailedNotes: data?.detailedNotes || 0,
        bulletNotes: data?.bulletNotes || 0,
        pdfExports: data?.pdfExports || 0
      };
    } catch (error) {
      console.error('❌ Error getting today usage:', error);
      // Firestore permission hatası durumunda default usage dön
      if (error.code === 'permission-denied') {
        console.warn('🔒 Firestore permission denied, returning default usage');
      }
      return defaultUsage;
    }
  }

  /**
   * Plan değiştir - sadece Firestore'u güncelle
   */
  async changePlan(newPlan: SubscriptionType): Promise<void> {
    const user = AuthService.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      console.log('🔄 Changing plan to:', newPlan);

      await firestore()
        .collection('users')
        .doc(user.uid)
        .update({
          'subscription.plan': newPlan,
          'subscription.isActive': true,
          'subscription.updatedAt': firestore.FieldValue.serverTimestamp(),
        });

      // Günlük kullanımı sıfırla
      const today = new Date().toISOString().split('T')[0];
      await firestore()
        .collection('daily_usage')
        .doc(`${user.uid}_${today}`)
        .delete();

      console.log('✅ Plan changed successfully');
    } catch (error) {
      console.error('❌ Error changing plan:', error);
      throw error;
    }
  }

  /**
   * Kullanım sayacını artır
   */
  async incrementUsage(action: keyof UsageData): Promise<void> {
    const user = AuthService.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      const usageRef = firestore()
        .collection('daily_usage')
        .doc(`${user.uid}_${today}`);

      await firestore().runTransaction(async (transaction) => {
        const usageDoc = await transaction.get(usageRef);
        
        if (!usageDoc.exists) {
          transaction.set(usageRef, {
            userId: user.uid,
            date: today,
            [action]: 1,
            createdAt: firestore.FieldValue.serverTimestamp(),
          });
        } else {
          transaction.update(usageRef, {
            [action]: firestore.FieldValue.increment(1),
            updatedAt: firestore.FieldValue.serverTimestamp(),
          });
        }
      });

      console.log(`📊 Usage incremented: ${action}`);
    } catch (error) {
      console.error('❌ Error incrementing usage:', error);
      // Firestore permission hatası durumunda sessizce devam et
      if (error.code === 'permission-denied') {
        console.warn('🔒 Firestore permission denied, skipping usage tracking');
        return; // Hata fırlatma, sessizce geç
      }
      throw error;
    }
  }

  /**
   * Bir eylemi yapıp yapamayacağını kontrol et
   */
  async canPerformAction(action: keyof UsageData): Promise<{ canPerform: boolean; reason?: string }> {
    try {
      const subscription = await this.getUserSubscription();
      const limits = this.getPlanLimits(subscription.plan);
      const usage = await this.getTodayUsage();

      const limit = limits[action];
      const currentUsage = usage[action];

      // -1 unlimited demek
      if (limit === -1) {
        return { canPerform: true };
      }

      if (currentUsage >= limit) {
        return {
          canPerform: false,
          reason: `Daily ${action} limit reached (${currentUsage}/${limit}). Upgrade your plan for more usage.`,
        };
      }

      return { canPerform: true };
    } catch (error) {
      console.error('❌ Error checking action permission:', error);
      // Firestore permission hatası durumunda izin ver
      if (error.code === 'permission-denied') {
        console.warn('🔒 Firestore permission denied, allowing action by default');
      }
      // Hata durumunda izin ver
      return { canPerform: true };
    }
  }
}

export const SubscriptionService = new SubscriptionServiceClass();