import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class AuthService {
  static async signUp(email: string, password: string, displayName?: string): Promise<User> {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      
      // Update user profile with display name
      if (displayName && userCredential.user) {
        await userCredential.user.updateProfile({
          displayName: displayName,
        });
      }

      const user: User = {
        uid: userCredential.user.uid,
        email: userCredential.user.email || email,
        displayName: displayName || userCredential.user.displayName || undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Save to Firestore after getting auth token
      try {
        await firestore()
          .collection('users')
          .doc(user.uid)
          .set({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            createdAt: firestore.FieldValue.serverTimestamp(),
            updatedAt: firestore.FieldValue.serverTimestamp(),
          });

        console.log('✅ User successfully created in Firestore:', user.uid);
      } catch (firestoreError: any) {
        console.warn('⚠️ Firestore write error (user created but could not be saved to Firestore):', firestoreError);
        // Firestore hatası olsa bile kullanıcı oluşturuldu, bu yüzden devam et
      }

      return user;
    } catch (error: any) {
      console.error('Firebase SignUp Error:', error);
      throw new Error(this.getFirebaseErrorMessage(error.code));
    }
  }

  static async signIn(email: string, password: string): Promise<User> {
    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      
      // Create basic user object (from Authentication)
      let user: User = {
        uid: userCredential.user.uid,
        email: userCredential.user.email || email,
        displayName: userCredential.user.displayName || undefined,
      };

      // Try to fetch user information from Firestore (optional)
      try {
        const userDoc = await firestore()
          .collection('users')
          .doc(userCredential.user.uid)
          .get();

        if (userDoc.exists) {
          const userData = userDoc.data();
          user = {
            uid: userCredential.user.uid,
            email: userCredential.user.email || email,
            displayName: userData?.displayName || userCredential.user.displayName || undefined,
            createdAt: userData?.createdAt?.toDate(),
            updatedAt: userData?.updatedAt?.toDate(),
          };
          console.log('✅ User data loaded from Firestore');
        } else {
          console.log('ℹ️ User not found in Firestore, using Auth data only');
        }
      } catch (firestoreError: any) {
        console.warn('⚠️ Firestore read error (login successful but Firestore data could not be retrieved):', firestoreError.message);
        // Login successful even if Firestore error occurs, use only Auth data
      }

      return user;
    } catch (error: any) {
      console.error('Firebase SignIn Error:', error);
      throw new Error(this.getFirebaseErrorMessage(error.code));
    }
  }

  static async signOut(): Promise<void> {
    try {
      await auth().signOut();
    } catch (error: any) {
      console.error('Firebase SignOut Error:', error);
      throw new Error('Failed to sign out. Please try again.');
    }
  }

  static async resetPassword(email: string): Promise<void> {
    try {
      await auth().sendPasswordResetEmail(email);
    } catch (error: any) {
      console.error('Firebase Password Reset Error:', error);
      throw new Error(this.getFirebaseErrorMessage(error.code));
    }
  }

  static getCurrentUser(): User | null {
    const firebaseUser = auth().currentUser;
    if (!firebaseUser) return null;

    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName: firebaseUser.displayName || undefined,
    };
  }

      // Get detailed user information from Firestore
  static async getCurrentUserDetails(): Promise<User | null> {
    const firebaseUser = auth().currentUser;
    if (!firebaseUser) return null;

    // Basic user data (from Auth)
    let user: User = {
      uid: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName: firebaseUser.displayName || undefined,
    };

    // Try to fetch additional information from Firestore
    try {
      const userDoc = await firestore()
        .collection('users')
        .doc(firebaseUser.uid)
        .get();

      if (userDoc.exists) {
        const userData = userDoc.data();
        user = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: userData?.displayName || firebaseUser.displayName || undefined,
          createdAt: userData?.createdAt?.toDate(),
          updatedAt: userData?.updatedAt?.toDate(),
        };
        console.log('✅ Current user details loaded from Firestore');
      } else {
        console.log('ℹ️ Current user not found in Firestore, using Auth data only');
      }
    } catch (error) {
      console.warn('⚠️ Firestore read error (current user info retrieved from Auth):', error);
      // Firestore hatası olsa bile Auth verilerini döndür
    }

    return user;
  }

  // Manuel olarak kullanıcı profili oluştur (Authentication sonrası)
  static async createUserProfile(user: User): Promise<void> {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error('User must be authenticated to create profile');
      }

      await firestore()
        .collection('users')
        .doc(user.uid)
        .set({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          createdAt: firestore.FieldValue.serverTimestamp(),
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });

      console.log('✅ User profile created successfully in Firestore');
    } catch (error) {
      console.error('❌ Error creating user profile:', error);
      throw error;
    }
  }

  static onAuthStateChanged(callback: (user: User | null) => void) {
    return auth().onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        const user: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || undefined,
        };
        callback(user);
      } else {
        callback(null);
      }
    });
  }

  // Delete user data from Firestore
  static async deleteUserData(userId: string): Promise<void> {
    try {
      console.log('🗑️ Starting user data deletion for userId:', userId);
      const firestore = require('@react-native-firebase/firestore').default;
      
      // Delete user's collections in parallel
      const batch = firestore().batch();
      
      // Delete main user document from 'users' collection
      const userRef = firestore().collection('users').doc(userId);
      batch.delete(userRef);
      console.log('📝 Added users document deletion to batch');
      
      // Delete subscriptions
      const subscriptionRef = firestore().collection('subscriptions').doc(userId);
      batch.delete(subscriptionRef);
      console.log('📝 Added subscriptions document deletion to batch');
      
      // Delete daily usage records
      const usageSnapshot = await firestore()
        .collection('daily_usage')
        .where('userId', '==', userId)
        .get();
      
      console.log('📊 Found', usageSnapshot.size, 'daily usage records to delete');
      usageSnapshot.forEach((doc: any) => {
        batch.delete(doc.ref);
      });
      
      // Delete user profiles
      const profileRef = firestore().collection('user_profiles').doc(userId);
      batch.delete(profileRef);
      console.log('📝 Added user_profiles document deletion to batch');
      
      // Execute batch delete
      console.log('⚡ Executing batch delete...');
      await batch.commit();
      
      console.log('✅ User data deleted from Firestore successfully');
    } catch (error) {
      console.error('❌ Error deleting user data:', error);
      throw new Error('Failed to delete user data from database');
    }
  }

  // Delete Firebase Auth account
  static async deleteAccount(): Promise<void> {
    try {
      const user = auth().currentUser;
      if (!user) {
        throw new Error('No user found to delete');
      }
      
      await user.delete();
      console.log('✅ Firebase Auth account deleted');
    } catch (error: any) {
      console.error('❌ Error deleting Firebase Auth account:', error);
      
      if (error.code === 'auth/requires-recent-login') {
        throw new Error('For security, please log out and log back in before deleting your account.');
      }
      
      throw new Error('Failed to delete account. Please try again.');
    }
  }

  private static getFirebaseErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'This email address is already registered. Please use a different email or try logging in.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/operation-not-allowed':
        return 'Email/password accounts are not enabled. Please contact support.';
      case 'auth/weak-password':
        return 'Password is too weak. Please choose a stronger password.';
      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact support.';
      case 'auth/user-not-found':
        return 'No account found with this email address. Please check your email or create a new account.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/invalid-credential':
        return 'Invalid email or password. Please check your credentials and try again.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your internet connection and try again.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }
}