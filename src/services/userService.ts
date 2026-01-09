import firestore from '@react-native-firebase/firestore';
import { User } from './firebaseAuthService';

export class UserService {
  // Kullanıcı profil bilgilerini güncelle
  static async updateUserProfile(
    uid: string, 
    updates: Partial<Omit<User, 'uid' | 'createdAt'>>
  ): Promise<void> {
    try {
      await firestore()
        .collection('users')
        .doc(uid)
        .update({
          ...updates,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });
      
      console.log('User profile updated successfully');
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw new Error('Failed to update user profile');
    }
  }

  // Kullanıcı verilerini Firestore'dan getir
  static async getUserById(uid: string): Promise<User | null> {
    try {
      const userDoc = await firestore()
        .collection('users')
        .doc(uid)
        .get();

      if (userDoc.exists) {
        const userData = userDoc.data();
        return {
          uid: userData?.uid,
          email: userData?.email,
          displayName: userData?.displayName,
          createdAt: userData?.createdAt?.toDate(),
          updatedAt: userData?.updatedAt?.toDate(),
        };
      }

      return null;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw new Error('Failed to fetch user data');
    }
  }

  // Tüm kullanıcıları listele (admin için)
  static async getAllUsers(): Promise<User[]> {
    try {
      const usersSnapshot = await firestore()
        .collection('users')
        .orderBy('createdAt', 'desc')
        .get();

      return usersSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          uid: data.uid,
          email: data.email,
          displayName: data.displayName,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        };
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new Error('Failed to fetch users');
    }
  }

  // Kullanıcı istatistiklerini getir
  static async getUserStats(): Promise<{ totalUsers: number }> {
    try {
      const usersSnapshot = await firestore()
        .collection('users')
        .get();

      return {
        totalUsers: usersSnapshot.size,
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw new Error('Failed to fetch user statistics');
    }
  }
}
