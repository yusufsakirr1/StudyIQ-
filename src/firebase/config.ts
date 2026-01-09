// Firebase auto-initialization via google-services.json
import '@react-native-firebase/app';
import '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// Firebase'in otomatik olarak initialize edildiğini kontrol et
import { firebase } from '@react-native-firebase/app';

// Firestore offline persistence'ı etkinleştir
firestore().settings({
  persistence: true,
  cacheSizeBytes: firestore.CACHE_SIZE_UNLIMITED,
});

// Debug mode'da Firebase durumunu kontrol et
if (__DEV__) {
  setTimeout(async () => {
    console.log('Firebase apps:', firebase.apps.length);
    if (firebase.apps.length > 0) {
      console.log('✅ Firebase successfully initialized');
      console.log('App name:', firebase.app().name);
      console.log('Project ID:', firebase.app().options.projectId);
      
      // Firestore connection test
      try {
        const firestore = require('@react-native-firebase/firestore').default;
        await firestore().collection('test').limit(1).get();
        console.log('✅ Firestore connection successful');
      } catch (error) {
        console.log('❌ Firestore connection failed:', error.message);
      }
    } else {
      console.log('❌ Firebase not initialized');
    }
  }, 2000);
}
