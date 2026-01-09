import firestore from '@react-native-firebase/firestore';
import { AuthService } from './firebaseAuthService';

// Subscription Product IDs
export const SUBSCRIPTION_SKUS = {
  PRO_MONTHLY: 'pro-monthly',
  PRO_YEARLY: 'pro-yearly',
  PREMIUM_MONTHLY: 'premium-monthly',
  PREMIUM_YEARLY: 'premium-yearly',
};

export interface SubscriptionPlan {
  productId: string;
  title: string;
  description: string;
  price: string;
  currency: string;
  period: 'monthly' | 'yearly';
}

// Mock data for testing
const MOCK_SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    productId: SUBSCRIPTION_SKUS.PRO_MONTHLY,
    title: 'Pro Monthly',
    description: 'Pro plan with monthly billing',
    price: '$2.99',
    currency: 'USD',
    period: 'monthly',
  },
  {
    productId: SUBSCRIPTION_SKUS.PRO_YEARLY,
    title: 'Pro Yearly',
    description: 'Pro plan with yearly billing (17% discount)',
    price: '$29.90',
    currency: 'USD',
    period: 'yearly',
  },
  {
    productId: SUBSCRIPTION_SKUS.PREMIUM_MONTHLY,
    title: 'Premium Monthly',
    description: 'Premium plan with monthly billing',
    price: '$4.99',
    currency: 'USD',
    period: 'monthly',
  },
  {
    productId: SUBSCRIPTION_SKUS.PREMIUM_YEARLY,
    title: 'Premium Yearly',
    description: 'Premium plan with yearly billing (17% discount)',
    price: '$49.90',
    currency: 'USD',
    period: 'yearly',
  },
];

export class IAPService {
  static async initialize(): Promise<boolean> {
    return true;
  }

  static async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return MOCK_SUBSCRIPTION_PLANS;
  }

  static async purchaseSubscription(productId: string): Promise<boolean> {
    try {
      const user = AuthService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Direkt olarak Firestore'u güncelle
      await firestore().collection('users').doc(user.uid).update({
        'subscription.plan': productId,
        'subscription.isActive': true,
        'subscription.updatedAt': firestore.FieldValue.serverTimestamp(),
        'subscription.testMode': true
      });

      // Subscription koleksiyonunu güncelle
      await firestore().collection('subscriptions').doc(user.uid).set({
        productId,
        planType: productId,
        isActive: true,
        startDate: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
        userId: user.uid,
        testMode: true
      });

      console.log('✅ Plan updated successfully:', productId);
      return true;
    } catch (error) {
      console.error('❌ Plan update failed:', error);
      return false;
    }
  }

  static async restorePurchases(): Promise<boolean> {
    try {
      const user = AuthService.getCurrentUser();
      if (!user) return false;

      const userDoc = await firestore()
        .collection('users')
        .doc(user.uid)
        .get();

      if (!userDoc.exists) return false;

      const subscription = userDoc.data()?.subscription;
      return subscription?.isActive || false;
    } catch (error) {
      console.error('❌ Failed to restore subscription:', error);
      return false;
    }
  }

  static cleanup() {
    // Cleanup not needed anymore
  }
}