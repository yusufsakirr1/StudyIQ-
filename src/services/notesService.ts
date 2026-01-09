import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export interface SavedNote {
  id: string;
  title: string;
  originalText: string;
  format: string;
  processedData: any;
  createdAt: Date;
  updatedAt: Date;
}

const NOTES_STORAGE_KEY = 'saved_notes';

export class NotesService {
  // Save note to both local storage and Firestore
  static async saveNote(note: Omit<SavedNote, 'id' | 'createdAt' | 'updatedAt'>): Promise<SavedNote> {
    const currentUser = auth().currentUser;
    if (!currentUser) {
      throw new Error('User must be authenticated to save notes');
    }

    const now = new Date();
    const newNote: SavedNote = {
      ...note,
      id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now,
      updatedAt: now,
    };

    try {
      // Save to Firestore
      await firestore()
        .collection('users')
        .doc(currentUser.uid)
        .collection('notes')
        .doc(newNote.id)
        .set({
          ...newNote,
          createdAt: firestore.Timestamp.fromDate(newNote.createdAt),
          updatedAt: firestore.Timestamp.fromDate(newNote.updatedAt),
        });

      console.log('✅ Note saved to Firestore');
    } catch (firestoreError) {
      console.warn('⚠️ Firestore save failed, saving locally only:', firestoreError);
    }

    // Always save locally as backup
    try {
      const existingNotes = await this.getLocalNotes();
      const updatedNotes = [...existingNotes, newNote];
      await AsyncStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(updatedNotes));
      console.log('✅ Note saved locally');
    } catch (localError) {
      console.error('❌ Local save failed:', localError);
      throw new Error('Failed to save note');
    }

    return newNote;
  }

  // Get all notes (from Firestore first, fallback to local)
  static async getAllNotes(): Promise<SavedNote[]> {
    const currentUser = auth().currentUser;
    
    if (currentUser) {
      try {
        // Try to get from Firestore first
        const notesSnapshot = await firestore()
          .collection('users')
          .doc(currentUser.uid)
          .collection('notes')
          .orderBy('createdAt', 'desc')
          .get();

        if (!notesSnapshot.empty) {
          const firestoreNotes = notesSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              title: data.title,
              originalText: data.originalText,
              format: data.format,
              processedData: data.processedData,
              createdAt: data.createdAt.toDate(),
              updatedAt: data.updatedAt.toDate(),
            } as SavedNote;
          });

          console.log('✅ Notes loaded from Firestore');
          return firestoreNotes;
        }
      } catch (firestoreError) {
        console.warn('⚠️ Firestore read failed, falling back to local storage:', firestoreError);
      }
    }

    // Fallback to local storage
    try {
      const localNotes = await this.getLocalNotes();
      console.log('✅ Notes loaded from local storage');
      return localNotes;
    } catch (localError) {
      console.error('❌ Local read failed:', localError);
      return [];
    }
  }

  // Get notes from local storage only
  static async getLocalNotes(): Promise<SavedNote[]> {
    try {
      const notesJson = await AsyncStorage.getItem(NOTES_STORAGE_KEY);
      if (notesJson) {
        const notes = JSON.parse(notesJson);
        // Convert date strings back to Date objects
        return notes.map((note: any) => ({
          ...note,
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt),
        }));
      }
      return [];
    } catch (error) {
      console.error('Error reading local notes:', error);
      return [];
    }
  }

  // Delete a note
  static async deleteNote(noteId: string): Promise<void> {
    const currentUser = auth().currentUser;
    
    if (currentUser) {
      try {
        // Delete from Firestore
        await firestore()
          .collection('users')
          .doc(currentUser.uid)
          .collection('notes')
          .doc(noteId)
          .delete();
        console.log('✅ Note deleted from Firestore');
      } catch (firestoreError) {
        console.warn('⚠️ Firestore delete failed:', firestoreError);
      }
    }

    // Delete from local storage
    try {
      const existingNotes = await this.getLocalNotes();
      const updatedNotes = existingNotes.filter(note => note.id !== noteId);
      await AsyncStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(updatedNotes));
      console.log('✅ Note deleted locally');
    } catch (localError) {
      console.error('❌ Local delete failed:', localError);
      throw new Error('Failed to delete note');
    }
  }

  // Update a note
  static async updateNote(noteId: string, updates: Partial<SavedNote>): Promise<void> {
    const currentUser = auth().currentUser;
    const now = new Date();

    if (currentUser) {
      try {
        // Update in Firestore
        await firestore()
          .collection('users')
          .doc(currentUser.uid)
          .collection('notes')
          .doc(noteId)
          .update({
            ...updates,
            updatedAt: firestore.Timestamp.fromDate(now),
          });
        console.log('✅ Note updated in Firestore');
      } catch (firestoreError) {
        console.warn('⚠️ Firestore update failed:', firestoreError);
      }
    }

    // Update in local storage
    try {
      const existingNotes = await this.getLocalNotes();
      const updatedNotes = existingNotes.map(note => 
        note.id === noteId 
          ? { ...note, ...updates, updatedAt: now }
          : note
      );
      await AsyncStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(updatedNotes));
      console.log('✅ Note updated locally');
    } catch (localError) {
      console.error('❌ Local update failed:', localError);
      throw new Error('Failed to update note');
    }
  }
}
