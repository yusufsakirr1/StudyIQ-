// Enhanced Mock Authentication Service that simulates Firebase behavior
export interface User {
  uid: string;
  email: string;
  displayName?: string;
}

let currentUser: User | null = null;
let authStateListeners: ((user: User | null) => void)[] = [];
let registeredUsers: User[] = []; // Simulate user database

export class AuthService {
  static async signUp(email: string, password: string, displayName?: string): Promise<User> {
    // Mock implementation with enhanced logging
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    
    // Check if user already exists
    const existingUser = registeredUsers.find(user => user.email === email);
    if (existingUser) {
      throw new Error('This email address is already registered. Please use a different email or try logging in.');
    }
    
    const user: User = {
      uid: Math.random().toString(36).substring(7),
      email: email,
      displayName: displayName,
    };
    
    // Add to registered users database
    registeredUsers.push(user);
    
    // Enhanced logging to simulate Firebase console
    console.log('\n🔥 FIREBASE AUTHENTICATION (Simulated)');
    console.log('📝 New user registered in Firebase Auth:');
    console.log('┌─────────────────────────────────────────────────────────┐');
    console.log(`│ UID: ${user.uid}                                  │`);
    console.log(`│ Email: ${user.email.padEnd(30)}             │`);
    console.log(`│ Display Name: ${(user.displayName || 'N/A').padEnd(20)}                 │`);
    console.log(`│ Created: ${new Date().toLocaleString()}              │`);
    console.log(`│ Total Users: ${registeredUsers.length}                                     │`);
    console.log('└─────────────────────────────────────────────────────────┘');
    console.log('✅ User successfully saved to Firebase Authentication');
    console.log('📊 Check Firebase Console > Authentication > Users to see this user');
    console.log('─'.repeat(60));
    
    currentUser = user;
    this.notifyListeners();
    return user;
  }

  static async signIn(email: string, password: string): Promise<User> {
    // Mock implementation with user lookup
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    
    // Simple mock validation
    if (!email.includes('@')) {
      throw new Error('Invalid email address');
    }
    
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
    
    // Try to find existing user
    const existingUser = registeredUsers.find(user => user.email === email);
    let user: User;
    
    if (existingUser) {
      user = existingUser;
      console.log('\n🔥 FIREBASE AUTHENTICATION (Simulated)');
      console.log('🔑 User successfully signed in');
      console.log(`📧 Email: ${user.email}`);
      console.log('─'.repeat(40));
    } else {
      // Create user if not found (simulate Firebase auto-registration)
      user = {
        uid: Math.random().toString(36).substring(7),
        email: email,
        displayName: 'User',
      };
      registeredUsers.push(user);
      
      console.log('\n🔥 FIREBASE AUTHENTICATION (Simulated)');
      console.log('📝 New user auto-created during login:');
      console.log('┌─────────────────────────────────────────────────────────┐');
      console.log(`│ UID: ${user.uid}                                  │`);
      console.log(`│ Email: ${user.email.padEnd(30)}             │`);
      console.log(`│ Created: ${new Date().toLocaleString()}              │`);
      console.log('└─────────────────────────────────────────────────────────┘');
      console.log('─'.repeat(60));
    }
    
    currentUser = user;
    this.notifyListeners();
    return user;
  }

  static async signOut(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    currentUser = null;
    this.notifyListeners();
  }

  static async resetPassword(email: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    
    if (!email.includes('@')) {
      throw new Error('Invalid email address');
    }
    
    // Mock success - no actual email sent
    console.log(`Mock: Password reset email would be sent to ${email}`);
  }

  static getCurrentUser(): User | null {
    return currentUser;
  }

  static onAuthStateChanged(callback: (user: User | null) => void) {
    authStateListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      authStateListeners = authStateListeners.filter(listener => listener !== callback);
    };
  }

  private static notifyListeners() {
    authStateListeners.forEach(listener => {
      listener(currentUser);
    });
  }

  // Debugging method to see all registered users
  static getAllRegisteredUsers(): User[] {
    console.log('\n🔥 FIREBASE AUTHENTICATION USERS DATABASE (Simulated)');
    console.log('═'.repeat(70));
    console.log(`📊 Total Users: ${registeredUsers.length}`);
    console.log('═'.repeat(70));
    
    if (registeredUsers.length === 0) {
      console.log('📝 No users registered yet');
    } else {
      registeredUsers.forEach((user, index) => {
        console.log(`\n👤 User ${index + 1}:`);
        console.log(`   UID: ${user.uid}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Display Name: ${user.displayName || 'N/A'}`);
        console.log('   Status: Active');
      });
    }
    
    console.log('\n═'.repeat(70));
    console.log('💡 These users would appear in Firebase Console > Authentication > Users');
    console.log('💡 To add them to real Firebase, copy the emails and manually add them');
    console.log('═'.repeat(70));
    
    return registeredUsers;
  }

  // Export users in Firebase format for manual import
  static getFirebaseImportData() {
    const firebaseFormat = registeredUsers.map(user => ({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      emailVerified: false,
      disabled: false,
      metadata: {
        creationTime: new Date().toISOString(),
        lastSignInTime: new Date().toISOString()
      },
      providerData: [{
        uid: user.email,
        email: user.email,
        providerId: 'password'
      }]
    }));
    
    console.log('\n🔥 FIREBASE IMPORT FORMAT:');
    console.log(JSON.stringify(firebaseFormat, null, 2));
    console.log('\n💡 Copy this JSON to import users into Firebase Authentication');
    
    return firebaseFormat;
  }
}