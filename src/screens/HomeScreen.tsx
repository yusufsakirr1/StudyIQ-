import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import MaterialIcon from '@react-native-vector-icons/material-icons';
import { processNote } from '../services/openaiService';
import { SubscriptionService, SubscriptionType } from '../services/subscriptionService';
import { useDarkMode } from '../contexts/DarkModeContext';

const { width } = Dimensions.get('window');

const HomeScreen = ({navigation}: any) => {
  const { isDarkMode } = useDarkMode();
  const [noteText, setNoteText] = useState('');
  const [inputMode, setInputMode] = useState<'text' | 'voice'>('text');
  const [format, setFormat] = useState('Summary');
  const [showFormatOptions, setShowFormatOptions] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [subscriptionType, setSubscriptionType] = useState<SubscriptionType>('free');
  const [usageData, setUsageData] = useState({ detailedNotes: 0, bulletNotes: 0, summaryNotes: 0 });
  
  const formatOptions = ['Summary', 'Detailed', 'Bullet Points'];

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      const subscription = await SubscriptionService.getUserSubscription();
      setSubscriptionType(subscription.type);
      
      const todayUsage = await SubscriptionService.getTodayUsage();
      setUsageData({
        detailedNotes: todayUsage.detailedNotes,
        bulletNotes: todayUsage.bulletNotes,
        summaryNotes: todayUsage.summaryNotes
      });
    } catch (error) {
      console.error('Error loading subscription data:', error);
    }
  };

  const organizeNotes = async () => {
    if (!noteText.trim()) return;
    
    // Check usage limit based on format
    const noteType = format === 'Summary' ? 'summary' : 
                    format === 'Detailed' ? 'detailed' : 'bullet';
    
    try {
      const usageCheck = await SubscriptionService.canPerformAction(noteType === 'summary' ? 'summaryNotes' : 
                                                           noteType === 'detailed' ? 'detailedNotes' : 'bulletNotes');
      
      if (!usageCheck.canPerform) {
        Alert.alert(
          'Daily Limit Reached',
          usageCheck.reason || `Your daily limit for ${format} notes has been reached. Upgrade to create more notes.`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Upgrade', onPress: () => navigation.navigate('Upgrade') }
          ]
        );
        return;
      }
      
      setIsProcessing(true);
      
      const processedData = await processNote({
        text: noteText.trim(),
        format: format as 'Summary' | 'Detailed' | 'Bullet Points'
      });
      
      // Increment usage
      await SubscriptionService.incrementUsage(noteType);
      
      // Update usage data
      await loadSubscriptionData();
      
      navigation.navigate('Results', {
        originalText: noteText,
        format: format,
        processedData: processedData
      });
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'An error occurred while processing notes. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, isDarkMode && styles.darkContainer]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive">
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <MaterialIcon name="auto-awesome" size={28} color={isDarkMode ? "#ffffff" : "#000000"} />
            <Text style={[styles.headerTitle, isDarkMode && styles.darkText]}>StudyIQ</Text>
          </View>
          <TouchableOpacity 
            style={styles.upgradeButton}
            onPress={() => navigation.navigate('Upgrade')}>
            <MaterialIcon name="rocket-launch" size={20} color="#8B5CF6" />
            <Text style={styles.upgradeButtonText}>Upgrade</Text>
          </TouchableOpacity>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={[styles.heroTitle, isDarkMode && styles.darkText]}>
            Transform Your Notes
          </Text>
          <Text style={[styles.heroSubtitle, isDarkMode && styles.darkSubtitle]}>
            AI-powered note organization and study assistance
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={[styles.quickActionCard, isDarkMode && styles.darkQuickActionCard]}
              onPress={() => navigation.navigate('AITeacher')}>
              <View style={styles.quickActionIconContainer}>
                <MaterialIcon name="psychology" size={24} color="#8B5CF6" />
                <View style={styles.betaBadge}>
                  <Text style={styles.betaText}>BETA</Text>
                </View>
              </View>
              <Text style={[styles.quickActionTitle, isDarkMode && styles.darkText]}>AI Teacher</Text>
              <Text style={[styles.quickActionSubtitle, isDarkMode && styles.darkSubtitle]}>Get help with your studies</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.quickActionCard, isDarkMode && styles.darkQuickActionCard]}
              onPress={() => navigation.navigate('Notes')}>
              <MaterialIcon name="description" size={24} color="#10B981" />
              <Text style={[styles.quickActionTitle, isDarkMode && styles.darkText]}>My Notes</Text>
              <Text style={[styles.quickActionSubtitle, isDarkMode && styles.darkSubtitle]}>View saved notes</Text>
            </TouchableOpacity>
          </View>
        </View>


        {/* Main Content - ChatGPT Style */}
        <View style={styles.mainContent}>
          {/* Centered Input Section */}
          <View style={styles.centeredInputSection}>
            {/* Slogan */}
            <Text style={[styles.inputSlogan, isDarkMode && styles.darkInputSlogan]}>
              What would you like to organize today?
            </Text>
            
            {/* Input Container */}
            <View style={[styles.inputContainer, isDarkMode && styles.darkInputContainer]}>
              <View style={styles.inputRow}>
                {/* Left Icon */}
                <TouchableOpacity style={styles.leftIconButton}>
                  <MaterialIcon 
                    name="add" 
                    size={20} 
                    color={isDarkMode ? "#9ca3af" : "#6b7280"} 
                  />
                </TouchableOpacity>
                
                {/* Text Input */}
                <TextInput
                  style={[styles.chatInput, isDarkMode && styles.darkChatInput]}
                  placeholder="Paste or write your notes..."
                  placeholderTextColor={isDarkMode ? "#6b7280" : "#94a3b8"}
                  value={noteText}
                  onChangeText={setNoteText}
                  multiline
                />
                
                {/* Right Icons */}
                <View style={styles.rightIcons}>
                  <TouchableOpacity style={styles.voiceButton}>
                    <MaterialIcon 
                      name="mic" 
                      size={20} 
                      color={isDarkMode ? "#9ca3af" : "#6b7280"} 
                    />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[
                      styles.magicButtonInline, 
                      isDarkMode && styles.darkMagicButtonInline
                    ]}
                    onPress={organizeNotes}
                    disabled={!noteText.trim() || isProcessing}>
                    {isProcessing ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <MaterialIcon 
                        name="auto-fix-high" 
                        size={20} 
                        color="#ffffff"
                        style={{ opacity: 1 }}
                      />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Format Selector - Compact */}
            <TouchableOpacity 
              style={[styles.compactFormatContainer, isDarkMode && styles.darkCompactFormatContainer]}
              onPress={() => setShowFormatOptions(!showFormatOptions)}>
              <Text style={[styles.compactFormatLabel, isDarkMode && styles.darkText]}>
                {format}
              </Text>
              <MaterialIcon 
                name={showFormatOptions ? "expand-less" : "expand-more"} 
                size={16} 
                color={isDarkMode ? "#9ca3af" : "#6b7280"} 
              />
            </TouchableOpacity>
            
            {/* Format Options */}
            {showFormatOptions && (
              <View style={[styles.compactFormatOptions, isDarkMode && styles.darkCompactFormatOptions]}>
                {formatOptions.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.compactFormatOption,
                      isDarkMode && styles.darkCompactFormatOption,
                      format === option && styles.selectedCompactFormatOption,
                    ]}
                    onPress={() => {
                      setFormat(option);
                      setShowFormatOptions(false);
                    }}>
                    <Text 
                      style={[
                        styles.compactFormatOptionText,
                        isDarkMode && styles.darkText,
                        format === option && styles.selectedCompactFormatOptionText
                      ]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fc',
    paddingTop: 40,
  },
  darkContainer: {
    backgroundColor: '#111827',
  },
  darkText: {
    color: '#ffffff',
  },
  darkSubtitle: {
    color: '#9ca3af',
  },
  darkTextArea: {
    backgroundColor: '#1f2937',
    color: '#ffffff',
  },
  darkFormatContainer: {
    backgroundColor: '#1f2937',
    borderColor: '#374151',
  },
  darkFormatOptionsContainer: {
    backgroundColor: '#1f2937',
    borderColor: '#374151',
  },
  darkFormatOption: {
    backgroundColor: '#1f2937',
    borderBottomColor: '#374151',
  },
  darkQuickActionCard: {
    backgroundColor: '#1f2937',
    borderColor: '#374151',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  fixedInputSection: {
    backgroundColor: '#f7f9fc',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  darkFixedInputSection: {
    backgroundColor: '#111827',
    borderTopColor: '#374151',
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1c1f',
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  upgradeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  mainContent: {
    flex: 1,
  },
  // Hero Section
  heroSection: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1c1f',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  // Quick Actions
  quickActionsContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1c1f',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionIconContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  betaBadge: {
    position: 'absolute',
    top: -1,
    right: -4,
    backgroundColor: '#ff6b35',
    borderRadius: 4,
    paddingHorizontal: 2,
    paddingVertical: 1,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  betaText: {
    color: '#ffffff',
    fontSize: 6,
    fontWeight: 'bold',
    letterSpacing: 0.2,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1c1f',
    marginBottom: 4,
  },
  quickActionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  // ChatGPT Style Input Section
  centeredInputSection: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
    minHeight: 200,
  },
  inputSlogan: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '500',
  },
  darkInputSlogan: {
    color: '#9ca3af',
  },
  inputContainer: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 12,
  },
  darkInputContainer: {
    backgroundColor: '#1f2937',
    borderColor: '#374151',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  leftIconButton: {
    marginRight: 12,
    padding: 4,
  },
  chatInput: {
    flex: 1,
    fontSize: 16,
    color: '#1a1c1f',
    maxHeight: 120,
    paddingVertical: 8,
  },
  darkChatInput: {
    color: '#ffffff',
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  voiceButton: {
    padding: 8,
  },
  magicButtonInline: {
    backgroundColor: '#000000',
    borderRadius: 8,
    padding: 8,
    minWidth: 36,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 1,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  darkMagicButtonInline: {
    backgroundColor: '#000000',
  },
  disabledMagicButtonInline: {
    backgroundColor: '#000000',
    opacity: 0.5,
  },
  // Compact Format Selector
  compactFormatContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  darkCompactFormatContainer: {
    backgroundColor: '#374151',
    borderColor: '#4b5563',
  },
  compactFormatLabel: {
    fontSize: 14,
    color: '#1a1c1f',
    marginRight: 4,
  },
  compactFormatOptions: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  darkCompactFormatOptions: {
    backgroundColor: '#1f2937',
    borderColor: '#374151',
  },
  compactFormatOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  darkCompactFormatOption: {
    borderBottomColor: '#374151',
  },
  selectedCompactFormatOption: {
    backgroundColor: '#f8fafc',
  },
  compactFormatOptionText: {
    fontSize: 14,
    color: '#1a1c1f',
  },
  selectedCompactFormatOptionText: {
    fontWeight: '600',
    color: '#000000',
  },
});

export default HomeScreen;