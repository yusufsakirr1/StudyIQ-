import firestore from '@react-native-firebase/firestore';
import { AuthService } from './firebaseAuthService';

interface PlanLimits {
  aiMessages: number;
  notesPerDay: number;
  features: string[];
}

interface PlanConfig {
  name: string;
  limits: PlanLimits;
  price: {
    monthly: number;
    yearly: number;
  };
}

interface UsageResult {
  canPerform: boolean;
  reason?: string;
}

class PlanChangeServiceClass {
  private planConfigsRef = firestore().collection('planConfigs');
  private usersRef = firestore().collection('users');
  private usageRef = firestore().collection('daily_usage');

  // Sabit plan limitleri
  private readonly DEFAULT_PLAN_CONFIGS: { [key: string]: PlanConfig } = {
    'free': {
      name: 'Free Plan',
      limits: {
        aiMessages: 50,
        notesPerDay: 10,
        features: ['basic']
      },
      price: {
        monthly: 0,
        yearly: 0
      }
    },
    'pro-monthly': {
      name: 'Pro Plan (Monthly)',
      limits: {
        aiMessages: 300,
        notesPerDay: 100,
        features: ['basic', 'pro', 'export']
      },
      price: {
        monthly: 2.99,
        yearly: 0
      }
    },
    'pro-yearly': {
      name: 'Pro Plan (Yearly)',
      limits: {
        aiMessages: 300,
        notesPerDay: 100,
        features: ['basic', 'pro', 'export']
      },
      price: {
        monthly: 0,
        yearly: 29.90
      }
    },
    'premium-monthly': {
      name: 'Premium Plan (Monthly)',
      limits: {
        aiMessages: 750,
        notesPerDay: 250,
        features: ['basic', 'pro', 'premium', 'export']
      },
      price: {
        monthly: 4.99,
        yearly: 0
      }
    },
    'premium-yearly': {
      name: 'Premium Plan (Yearly)',
      limits: {
        aiMessages: 750,
        notesPerDay: 250,
        features: ['basic', 'pro', 'premium', 'export']
      },
      price: {
        monthly: 0,
        yearly: 49.90
      }
    }
  };

  // Plan limitleri cache
  private planConfigsCache: { [key: string]: PlanConfig } = this.DEFAULT_PLAN_CONFIGS;
  private lastCacheUpdate: number = 0;
  private CACHE_DURATION = 5 * 60 * 1000; // 5 dakika

  // Plan limitleri gerçek zamanlı dinleyici
  private setupPlanConfigsListener() {
    return this.planConfigsRef.onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added' || change.type === 'modified') {
          this.planConfigsCache[change.doc.id] = {
            ...this.DEFAULT_PLAN_CONFIGS[change.doc.id],
            ...change.doc.data() as PlanConfig
          };
        } else if (change.type === 'removed') {
          // Plan silinirse varsayılan konfigürasyona geri dön
          this.planConfigsCache[change.doc.id] = this.DEFAULT_PLAN_CONFIGS[change.doc.id];
        }
      });
      this.lastCacheUpdate = Date.now();
      console.log('📦 Plan configs cache updated:', this.planConfigsCache);
    });
  }

  // Plan limitleri al (cache veya yenile)
  private async getPlanConfigs(): Promise<{ [key: string]: PlanConfig }> {
    try {
      if (Date.now() - this.lastCacheUpdate > this.CACHE_DURATION) {
        const snapshot = await this.planConfigsRef.get();
        snapshot.forEach((doc) => {
          // Firestore'daki değerleri varsayılan değerlerle birleştir
          this.planConfigsCache[doc.id] = {
            ...this.DEFAULT_PLAN_CONFIGS[doc.id],
            ...doc.data() as PlanConfig
          };
        });
        this.lastCacheUpdate = Date.now();
      }
      return this.planConfigsCache;
    } catch (error) {
      console.error('❌ Error getting plan configs:', error);
      // Hata durumunda varsayılan konfigürasyonları kullan
      return this.DEFAULT_PLAN_CONFIGS;
    }
  }

  // Kullanıcının günlük kullanımını kontrol et
  private async checkDailyUsage(userId: string, actionType: keyof PlanLimits): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    const usageDoc = await this.usageRef
      .doc(`${userId}_${today}`)
      .get();

    return usageDoc.exists ? (usageDoc.data()?.[actionType] || 0) : 0;
  }

  // Kullanıcının planını al
  private async getUserPlan(userId: string): Promise<string> {
    const userDoc = await this.usersRef.doc(userId).get();
    return userDoc.exists ? (userDoc.data()?.subscription?.plan || 'free') : 'free';
  }

  // Kullanıcının bir işlemi yapıp yapamayacağını kontrol et
  async canPerformAction(actionType: string): Promise<UsageResult> {
    try {
      const user = AuthService.getCurrentUser();
      if (!user) {
        return { canPerform: false, reason: 'User not authenticated' };
      }

      const userPlan = await this.getUserPlan(user.uid);
      const planConfigs = await this.getPlanConfigs();
      const planConfig = planConfigs[userPlan];

      if (!planConfig) {
        console.error('Plan config not found for:', userPlan);
        return { canPerform: false, reason: 'Invalid subscription plan' };
      }

      // Özellik kontrolü
      if (actionType === 'feature') {
        return {
          canPerform: planConfig.limits.features.includes(actionType),
          reason: 'This feature requires a higher subscription plan'
        };
      }

      // Kullanım limiti kontrolü
      const currentUsage = await this.checkDailyUsage(user.uid, actionType as keyof PlanLimits);
      const limit = planConfig.limits[actionType as keyof PlanLimits];

      if (currentUsage >= limit) {
        return {
          canPerform: false,
          reason: `You have reached your daily ${actionType} limit (${limit})`
        };
      }

      return { canPerform: true };
    } catch (error) {
      console.error('Error checking action permission:', error);
      return { canPerform: false, reason: 'Error checking permissions' };
    }
  }

  // Kullanım sayacını artır
  async incrementUsage(actionType: string): Promise<void> {
    try {
      const user = AuthService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const today = new Date().toISOString().split('T')[0];
      const usageRef = this.usageRef.doc(`${user.uid}_${today}`);

      await firestore().runTransaction(async (transaction) => {
        const usageDoc = await transaction.get(usageRef);
        
        if (!usageDoc.exists) {
          transaction.set(usageRef, {
            userId: user.uid,
            date: today,
            [actionType]: 1
          });
        } else {
          transaction.update(usageRef, {
            [actionType]: firestore.FieldValue.increment(1)
          });
        }
      });

      console.log(`📊 Usage incremented for ${actionType}`);
    } catch (error) {
      console.error('Error incrementing usage:', error);
      throw error;
    }
  }

  // Plan değişikliği
  async changePlan(userId: string, newPlan: string): Promise<void> {
    try {
      const userRef = this.usersRef.doc(userId);
      const subscriptionRef = firestore().collection('subscriptions').doc(userId);
      
      await firestore().runTransaction(async (transaction) => {
        // Kullanıcı dokümanını al
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists) {
          throw new Error('User document not found');
        }

        // Subscription koleksiyonunu güncelle
        transaction.set(subscriptionRef, {
          productId: newPlan,
          planType: newPlan,
          isActive: true,
          startDate: firestore.FieldValue.serverTimestamp(),
          updatedAt: firestore.FieldValue.serverTimestamp(),
          userId: userId
        }, { merge: true });

        // Users koleksiyonunu güncelle
        transaction.update(userRef, {
          'subscription.plan': newPlan,
          'subscription.updatedAt': firestore.FieldValue.serverTimestamp(),
          'subscription.isActive': true
        });

        // Günlük kullanım limitlerini sıfırla
        const today = new Date().toISOString().split('T')[0];
        const usageRef = this.usageRef.doc(`${userId}_${today}`);
        transaction.delete(usageRef);
      });

      console.log(`✅ User ${userId} plan changed to ${newPlan}`);
    } catch (error) {
      console.error('Error changing plan:', error);
      throw error;
    }
  }

  // Abonelik satın alma işlemini yönet
  async handleSubscriptionPurchase(productId: string): Promise<void> {
    try {
      const user = AuthService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // ProductId'yi doğrudan plan tipi olarak kullan
      const planType = productId;

      // Planı değiştir
      await this.changePlan(user.uid, planType);

      // Subscription koleksiyonunu güncelle
      await firestore().collection('subscriptions').doc(user.uid).set({
        productId,
        planType,
        isActive: true,
        startDate: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
        userId: user.uid
      }, { merge: true });

      console.log('✅ Subscription purchase processed successfully');
    } catch (error) {
      console.error('Error handling subscription purchase:', error);
      throw error;
    }
  }

  // Aboneliği iptal et
  async cancelSubscription(userId: string): Promise<void> {
    try {
      await firestore().runTransaction(async (transaction) => {
        const userRef = this.usersRef.doc(userId);
        const subscriptionRef = firestore().collection('subscriptions').doc(userId);

        // Kullanıcı dokümanını güncelle
        transaction.update(userRef, {
          'subscription.plan': 'free',
          'subscription.isActive': false,
          'subscription.updatedAt': firestore.FieldValue.serverTimestamp(),
          'subscription.cancelledAt': firestore.FieldValue.serverTimestamp()
        });

        // Subscription dokümanını güncelle
        transaction.update(subscriptionRef, {
          isActive: false,
          cancelledAt: firestore.FieldValue.serverTimestamp()
        });
      });

      console.log(`✅ Subscription cancelled for user ${userId}`);
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    }
  }
}

export const PlanChangeService = new PlanChangeServiceClass();