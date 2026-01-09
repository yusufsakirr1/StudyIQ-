import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Clipboard,
  TextInput,
  Modal,
} from 'react-native';
import MaterialIcon from '@react-native-vector-icons/material-icons';
import { useDarkMode } from '../contexts/DarkModeContext';
import { NotesService } from '../services/notesService';

const ResultsScreen = ({navigation, route}: any) => {
  const { isDarkMode } = useDarkMode();
  const {originalText, format, processedData, isFromSaved} = route.params || {};
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const copyToClipboard = () => {
    try {
      // Extract all content from organized data
      let textToCopy = '';
      
      if (organizedContent && organizedContent.sections) {
        organizedContent.sections.forEach((section) => {
          if (section.items) {
            section.items.forEach((item) => {
              if (item.definition) {
                textToCopy += item.definition + '\n\n';
              }
            });
          }
        });
      }
      
      // Copy to clipboard
      Clipboard.setString(textToCopy.trim());
      Alert.alert('Copied!', 'Notes copied to clipboard successfully');
    } catch (error) {
      console.error('Copy error:', error);
      Alert.alert('Error', 'Failed to copy notes to clipboard');
    }
  };

  const exportToPDF = () => {
    // Export PDF functionality will be implemented later
  };

  const createNewNote = () => {
    navigation.navigate('Home');
  };

  const goBack = () => {
    navigation.goBack();
  };

  const handleSaveNote = async () => {
    if (!noteTitle.trim()) {
      Alert.alert('Error', 'Please enter a title for your note');
      return;
    }

    setIsSaving(true);
    try {
      await NotesService.saveNote({
        title: noteTitle.trim(),
        originalText,
        format,
        processedData,
      });
      
      setShowSaveModal(false);
      setNoteTitle('');
      Alert.alert(
        'Success', 
        'Note saved successfully!',
        [
          {
            text: 'View Notes',
            onPress: () => navigation.navigate('Notes'),
          },
          { text: 'OK' }
        ]
      );
    } catch (error) {
      console.error('Error saving note:', error);
      Alert.alert('Error', 'Failed to save note. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const openSaveModal = () => {
    // Generate a default title based on content
    const defaultTitle = `Note - ${format} - ${new Date().toLocaleDateString()}`;
    setNoteTitle(defaultTitle);
    setShowSaveModal(true);
  };

  // Use processed data from AI or fallback to demo content
  const organizedContent = processedData || {
    title: 'Sample Notes',
    sections: [
      {
        title: 'No Content',
        items: [
          {
            term: 'Error',
            definition: 'No processed content available. Please try again.',
          },
        ],
      },
    ],
  };

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      {/* Header */}
      <View style={[styles.header, isDarkMode && styles.darkHeader]}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <MaterialIcon name="arrow-back-ios" size={24} color={isDarkMode ? "#9ca3af" : "#666"} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDarkMode && styles.darkText]}>Your Organized Notes</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Content Card */}
        <View style={[styles.contentCard, isDarkMode && styles.darkContentCard]}>
          <Text style={[styles.contentTitle, isDarkMode && styles.darkText]}>{organizedContent.title}</Text>

          {organizedContent.sections.map((section, sectionIndex) => (
            <View key={sectionIndex} style={styles.section}>
              {section.items.map((item, itemIndex) => (
                <View key={itemIndex}>
                  <Text style={[styles.cleanContent, isDarkMode && styles.darkSubtext]}>{item.definition}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.secondaryButton, isDarkMode && styles.darkSecondaryButton]} onPress={copyToClipboard}>
              <MaterialIcon name="content-copy" size={20} color={isDarkMode ? "#9ca3af" : "#374151"} />
              <Text style={[styles.secondaryButtonText, isDarkMode && styles.darkSecondaryButtonText]}>Copy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.secondaryButton, isDarkMode && styles.darkSecondaryButton]} onPress={exportToPDF}>
              <MaterialIcon name="picture-as-pdf" size={20} color={isDarkMode ? "#9ca3af" : "#374151"} />
              <Text style={[styles.secondaryButtonText, isDarkMode && styles.darkSecondaryButtonText]}>Export PDF</Text>
              <View style={styles.proTag}>
                <Text style={styles.proTagText}>SOON</Text>
              </View>
            </TouchableOpacity>
          </View>
          
          {!isFromSaved && (
            <TouchableOpacity style={styles.saveButton} onPress={openSaveModal}>
              <MaterialIcon name="bookmark-add" size={24} color="white" />
              <Text style={styles.saveButtonText}>Save Note</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={styles.primaryButton} onPress={createNewNote}>
            <MaterialIcon name="add-circle" size={24} color="#111714" />
            <Text style={styles.primaryButtonText}>New Note</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Save Note Modal */}
      <Modal
        visible={showSaveModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSaveModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDarkMode && styles.darkModalContent]}>
            <Text style={[styles.modalTitle, isDarkMode && styles.darkText]}>Save Note</Text>
            
            <TextInput
              style={[styles.titleInput, isDarkMode && styles.darkTitleInput]}
              placeholder="Enter note title..."
              placeholderTextColor={isDarkMode ? "#6b7280" : "#9ca3af"}
              value={noteTitle}
              onChangeText={setNoteTitle}
              autoFocus={true}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowSaveModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveModalButton, isSaving && styles.disabledButton]}
                onPress={handleSaveNote}
                disabled={isSaving}
              >
                <Text style={styles.saveModalButtonText}>
                  {isSaving ? 'Saving...' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F6F4',
    marginTop: 40,
  },
  darkContainer: {
    backgroundColor: '#111827',
  },
  darkText: {
    color: '#ffffff',
  },
  darkSubtext: {
    color: '#9ca3af',
  },
  darkHeader: {
    backgroundColor: '#1f2937',
    borderBottomColor: '#374151',
  },
  darkContentCard: {
    backgroundColor: '#1f2937',
  },
  darkSecondaryButton: {
    backgroundColor: '#374151',
    borderColor: '#4b5563',
  },
  darkSecondaryButtonText: {
    color: '#d1d5db',
  },
  darkModalContent: {
    backgroundColor: '#1f2937',
  },
  darkTitleInput: {
    backgroundColor: '#374151',
    color: '#ffffff',
    borderColor: '#4b5563',
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
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111714',
  },
  headerSpacer: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  contentCard: {
    backgroundColor: 'white',
    margin: 24,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  contentTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111714',
    marginBottom: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111714',
    marginBottom: 8,
  },
  itemsList: {
    paddingLeft: 8,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  bullet: {
    fontSize: 16,
    color: '#111714',
    marginRight: 8,
    marginTop: 2,
  },
  itemContent: {
    flex: 1,
  },
  itemTerm: {
    fontWeight: 'bold',
    color: '#111714',
    fontSize: 14,
  },
  itemDefinition: {
    color: '#4a5568',
    fontSize: 14,
    lineHeight: 20,
  },
  actionButtons: {
    padding: 24,
    paddingTop: 16,
    gap: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    height: 48,
    gap: 8,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: 'bold',
  },
  proTag: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#fbbf24',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  proTagText: {
    color: '#92400e',
    fontSize: 10,
    fontWeight: 'bold',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    height: 56,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cleanContent: {
    fontSize: 16,
    color: '#4a5568',
    lineHeight: 24,
    marginBottom: 8,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    borderRadius: 16,
    height: 48,
    gap: 8,
    marginBottom: 12,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1c1f',
    marginBottom: 16,
    textAlign: 'center',
  },
  titleInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 24,
    backgroundColor: '#f8fafc',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  saveModalButton: {
    backgroundColor: '#3b82f6',
  },
  saveModalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ResultsScreen;