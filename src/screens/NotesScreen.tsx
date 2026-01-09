import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  RefreshControl,
} from 'react-native';
import MaterialIcon from '@react-native-vector-icons/material-icons';
import { useDarkMode } from '../contexts/DarkModeContext';
import { NotesService, SavedNote } from '../services/notesService';

const NotesScreen = ({ navigation }: any) => {
  const { isDarkMode } = useDarkMode();
  const [notes, setNotes] = useState<SavedNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      setIsLoading(true);
      const savedNotes = await NotesService.getAllNotes();
      setNotes(savedNotes);
    } catch (error) {
      console.error('Error loading notes:', error);
      Alert.alert('Error', 'Failed to load notes');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotes();
    setRefreshing(false);
  };

  const handleNotePress = (note: SavedNote) => {
    navigation.navigate('Results', {
      originalText: note.originalText,
      format: note.format,
      processedData: note.processedData,
      isFromSaved: true,
    });
  };

  const handleDeleteNote = (noteId: string, noteTitle: string) => {
    Alert.alert(
      'Delete Note',
      `Are you sure you want to delete "${noteTitle}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await NotesService.deleteNote(noteId);
              await loadNotes();
              Alert.alert('Success', 'Note deleted successfully');
            } catch (error) {
              console.error('Error deleting note:', error);
              Alert.alert('Error', 'Failed to delete note');
            }
          },
        },
      ]
    );
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const renderNoteCard = (note: SavedNote) => (
    <TouchableOpacity
      key={note.id}
      style={[styles.noteCard, isDarkMode && styles.darkNoteCard]}
      onPress={() => handleNotePress(note)}
    >
      <View style={styles.noteHeader}>
        <View style={styles.noteTitleContainer}>
          <Text style={[styles.noteTitle, isDarkMode && styles.darkText]} numberOfLines={1}>
            {note.title}
          </Text>
          <View style={[styles.formatTag, isDarkMode && styles.darkFormatTag]}>
            <Text style={[styles.formatTagText, isDarkMode && styles.darkFormatTagText]}>
              {note.format}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteNote(note.id, note.title)}
        >
          <MaterialIcon 
            name="delete-outline" 
            size={20} 
            color={isDarkMode ? "#ffffff" : "#374151"} 
          />
        </TouchableOpacity>
      </View>
      
      <Text style={[styles.notePreview, isDarkMode && styles.darkSubtext]} numberOfLines={3}>
        {truncateText(note.originalText)}
      </Text>
      
      <View style={styles.noteFooter}>
        <View style={styles.dateContainer}>
          <MaterialIcon 
            name="schedule" 
            size={14} 
            color={isDarkMode ? "#9ca3af" : "#6b7280"} 
          />
          <Text style={[styles.noteDate, isDarkMode && styles.darkSubtext]}>
            {formatDate(note.createdAt)}
          </Text>
        </View>
        <MaterialIcon 
          name="chevron-right" 
          size={20} 
          color={isDarkMode ? "#9ca3af" : "#6b7280"} 
        />
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcon 
        name="description" 
        size={64} 
        color={isDarkMode ? "#6b7280" : "#9ca3af"} 
      />
      <Text style={[styles.emptyTitle, isDarkMode && styles.darkText]}>
        No Notes Yet
      </Text>
      <Text style={[styles.emptySubtitle, isDarkMode && styles.darkSubtext]}>
        Create your first note by organizing some text on the Home screen
      </Text>
      <TouchableOpacity
        style={styles.createNoteButton}
        onPress={() => navigation.navigate('Home')}
      >
        <MaterialIcon name="add" size={20} color="white" />
        <Text style={styles.createNoteButtonText}>Create Note</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      {/* Header */}
      <View style={[styles.header, isDarkMode && styles.darkHeader]}>
        <View style={styles.headerContent}>
          <MaterialIcon 
            name="description" 
            size={28} 
            color={isDarkMode ? "#ffffff" : "#000000"} 
          />
          <Text style={[styles.headerTitle, isDarkMode && styles.darkText]}>
            My Notes
          </Text>
        </View>
        <Text style={[styles.noteCount, isDarkMode && styles.darkSubtext]}>
          {notes.length} {notes.length === 1 ? 'note' : 'notes'}
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, isDarkMode && styles.darkSubtext]}>
              Loading notes...
            </Text>
          </View>
        ) : notes.length === 0 ? (
          renderEmptyState()
        ) : (
          <View style={styles.notesList}>
            {notes.map(renderNoteCard)}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fc',
    marginTop: 40,
  },
  darkContainer: {
    backgroundColor: '#111827',
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  darkHeader: {
    backgroundColor: '#1f2937',
    borderBottomColor: '#374151',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1c1f',
  },
  darkText: {
    color: '#ffffff',
  },
  noteCount: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  darkSubtext: {
    color: '#9ca3af',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1c1f',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  createNoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#38e07b',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  createNoteButtonText: {
    color: '#111714',
    fontSize: 16,
    fontWeight: 'bold',
  },
  notesList: {
    gap: 12,
  },
  noteCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  darkNoteCard: {
    backgroundColor: '#1f2937',
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  noteTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1c1f',
    flex: 1,
  },
  formatTag: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  darkFormatTag: {
    backgroundColor: '#374151',
  },
  formatTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  darkFormatTagText: {
    color: '#d1d5db',
  },
  deleteButton: {
    padding: 4,
  },
  notePreview: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  noteFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  noteDate: {
    fontSize: 12,
    color: '#6b7280',
  },
});

export default NotesScreen;
