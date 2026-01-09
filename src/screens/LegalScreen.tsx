import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import MaterialIcon from '@react-native-vector-icons/material-icons';
import { useDarkMode } from '../contexts/DarkModeContext';
import PrivacyPolicy from '../legal/PrivacyPolicy';
import TermsOfService from '../legal/TermsOfService';
import TermsOfUse from '../legal/TermsOfUse';
import AIDisclaimer from '../legal/AIDisclaimer';

interface LegalScreenProps {
  navigation: any;
  route: {
    params?: {
      initialTab?: 'privacy' | 'terms' | 'terms-of-use' | 'ai-disclaimer';
    };
  };
}

const LegalScreen = ({ navigation, route }: LegalScreenProps) => {
  const { isDarkMode } = useDarkMode();
  const [activeTab, setActiveTab] = useState(
    route.params?.initialTab || 'privacy'
  );

  const goBack = () => {
    navigation.goBack();
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'privacy':
        return <PrivacyPolicy />;
      case 'terms':
        return <TermsOfService />;
      case 'terms-of-use':
        return <TermsOfUse />;
      case 'ai-disclaimer':
        return <AIDisclaimer />;
      default:
        return <PrivacyPolicy />;
    }
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'privacy':
        return 'Privacy Policy';
      case 'terms':
        return 'Terms of Service';
      case 'terms-of-use':
        return 'Terms of Use';
      case 'ai-disclaimer':
        return 'AI Disclaimer';
      default:
        return 'Privacy Policy';
    }
  };

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      {/* Header */}
      <View style={[styles.header, isDarkMode && styles.darkHeader]}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <MaterialIcon 
            name="arrow-back" 
            size={24} 
            color={isDarkMode ? '#ffffff' : '#1f2937'} 
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDarkMode && styles.darkText]}>
          {getTabTitle()}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Tab Navigation */}
      <View style={[styles.tabContainer, isDarkMode && styles.darkTabContainer]}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'privacy' && styles.activeTab,
            isDarkMode && activeTab === 'privacy' && styles.darkActiveTab,
          ]}
          onPress={() => setActiveTab('privacy')}>
          <MaterialIcon 
            name="privacy-tip" 
            size={18} 
            color={activeTab === 'privacy' ? '#ffffff' : (isDarkMode ? '#9ca3af' : '#6b7280')} 
          />
          <Text style={[
            styles.tabText,
            isDarkMode && styles.darkTabText,
            activeTab === 'privacy' && styles.activeTabText,
          ]}>
            Privacy
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'terms-of-use' && styles.activeTab,
            isDarkMode && activeTab === 'terms-of-use' && styles.darkActiveTab,
          ]}
          onPress={() => setActiveTab('terms-of-use')}>
          <MaterialIcon 
            name="description" 
            size={18} 
            color={activeTab === 'terms-of-use' ? '#ffffff' : (isDarkMode ? '#9ca3af' : '#6b7280')} 
          />
          <Text style={[
            styles.tabText,
            isDarkMode && styles.darkTabText,
            activeTab === 'terms-of-use' && styles.activeTabText,
          ]}>
            Terms
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'terms' && styles.activeTab,
            isDarkMode && activeTab === 'terms' && styles.darkActiveTab,
          ]}
          onPress={() => setActiveTab('terms')}>
          <MaterialIcon 
            name="gavel" 
            size={18} 
            color={activeTab === 'terms' ? '#ffffff' : (isDarkMode ? '#9ca3af' : '#6b7280')} 
          />
          <Text style={[
            styles.tabText,
            isDarkMode && styles.darkTabText,
            activeTab === 'terms' && styles.activeTabText,
          ]}>
            TOS
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'ai-disclaimer' && styles.activeTab,
            isDarkMode && activeTab === 'ai-disclaimer' && styles.darkActiveTab,
          ]}
          onPress={() => setActiveTab('ai-disclaimer')}>
          <MaterialIcon 
            name="smart-toy" 
            size={18} 
            color={activeTab === 'ai-disclaimer' ? '#ffffff' : (isDarkMode ? '#9ca3af' : '#6b7280')} 
          />
          <Text style={[
            styles.tabText,
            isDarkMode && styles.darkTabText,
            activeTab === 'ai-disclaimer' && styles.activeTabText,
          ]}>
            AI
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {renderContent()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    marginTop: 40,
  },
  darkContainer: {
    backgroundColor: '#111827',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  darkHeader: {
    backgroundColor: '#1f2937',
    borderBottomColor: '#374151',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerSpacer: {
    width: 40,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  darkTabContainer: {
    backgroundColor: '#1f2937',
    borderBottomColor: '#374151',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    gap: 8,
  },
  activeTab: {
    backgroundColor: '#3b82f6',
  },
  darkActiveTab: {
    backgroundColor: '#2563eb',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  darkTabText: {
    color: '#9ca3af',
  },
  activeTabText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  darkText: {
    color: '#ffffff',
  },
});

export default LegalScreen;