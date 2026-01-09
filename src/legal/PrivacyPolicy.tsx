import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { useDarkMode } from '../contexts/DarkModeContext';

const PrivacyPolicy = () => {
  const { isDarkMode } = useDarkMode();

  const handleLinkPress = () => {
    const url = 'https://www.termsfeed.com/live/a8e928db-68f9-48ae-b680-81fdce6e8c0d';
    
    Linking.openURL(url).catch(err => {
      console.error('Failed to open privacy policy URL:', err);
      Alert.alert(
        'Cannot Open Link',
        'Please visit: https://www.termsfeed.com/live/a8e928db-68f9-48ae-b680-81fdce6e8c0d',
        [{ text: 'OK' }]
      );
    });
  };

  return (
    <ScrollView style={[styles.container, isDarkMode && styles.darkContainer]}>
      <View style={styles.content}>
        <Text style={[styles.title, isDarkMode && styles.darkText]}>
          Privacy Policy
        </Text>
        
        <Text style={[styles.lastUpdated, isDarkMode && styles.darkSecondaryText]}>
          Last updated: December 2024
        </Text>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
            1. Information We Collect
          </Text>
          <Text style={[styles.text, isDarkMode && styles.darkText]}>
            We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support.
          </Text>
          
          <Text style={[styles.subTitle, isDarkMode && styles.darkText]}>
            Personal Information:
          </Text>
          <Text style={[styles.bulletText, isDarkMode && styles.darkText]}>
            • Email address and display name{'\n'}
            • Account preferences and settings{'\n'}
            • Study notes and educational content you create{'\n'}
            • Usage data and app interaction patterns
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
            2. How We Use Your Information
          </Text>
          <Text style={[styles.text, isDarkMode && styles.darkText]}>
            We use the information we collect to:
          </Text>
          <Text style={[styles.bulletText, isDarkMode && styles.darkText]}>
            • Provide, maintain, and improve our services{'\n'}
            • Process your requests and transactions{'\n'}
            • Send you technical notices and support messages{'\n'}
            • Personalize your learning experience{'\n'}
            • Analyze usage patterns to improve app functionality
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
            3. AI Services and Third-Party APIs
          </Text>
          <Text style={[styles.text, isDarkMode && styles.darkText]}>
            Our app uses artificial intelligence services provided by OpenAI to enhance your learning experience. When you interact with our AI teacher:
          </Text>
          <Text style={[styles.bulletText, isDarkMode && styles.darkText]}>
            • Your messages may be processed by third-party AI services{'\n'}
            • We do not store your conversations permanently{'\n'}
            • AI responses are generated automatically and may contain errors{'\n'}
            • We are not responsible for the accuracy of AI-generated content
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
            4. Data Storage and Security
          </Text>
          <Text style={[styles.text, isDarkMode && styles.darkText]}>
            We store your data using Firebase services provided by Google. We implement appropriate security measures to protect your information, but no method of transmission over the internet is 100% secure.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
            5. Data Sharing
          </Text>
          <Text style={[styles.text, isDarkMode && styles.darkText]}>
            We do not sell, trade, or otherwise transfer your personal information to third parties, except:
          </Text>
          <Text style={[styles.bulletText, isDarkMode && styles.darkText]}>
            • To provide our services (e.g., cloud storage, AI processing){'\n'}
            • To comply with legal obligations{'\n'}
            • To protect our rights and safety{'\n'}
            • With your explicit consent
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
            6. Your Rights
          </Text>
          <Text style={[styles.text, isDarkMode && styles.darkText]}>
            You have the right to:
          </Text>
          <Text style={[styles.bulletText, isDarkMode && styles.darkText]}>
            • Access your personal data{'\n'}
            • Correct inaccurate information{'\n'}
            • Delete your account and associated data{'\n'}
            • Export your data{'\n'}
            • Object to processing of your data
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
            7. Children's Privacy
          </Text>
          <Text style={[styles.text, isDarkMode && styles.darkText]}>
            Our service is not intended for children under 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
            8. Changes to This Policy
          </Text>
          <Text style={[styles.text, isDarkMode && styles.darkText]}>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
            9. Contact Us
          </Text>
          <Text style={[styles.text, isDarkMode && styles.darkText]}>
            If you have any questions about this Privacy Policy, please contact us at:
          </Text>
          <Text style={[styles.contactText, isDarkMode && styles.darkContactText]}>
            Email: sakiryusuf36@gmail.com{'\n'}
            Subject: StudyIQ Privacy Policy Inquiry
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
            10. Full Privacy Policy
          </Text>
          <Text style={[styles.text, isDarkMode && styles.darkText]}>
            For the complete and detailed Privacy Policy, please visit:
          </Text>
          <TouchableOpacity onPress={handleLinkPress}>
            <Text style={[styles.linkText, isDarkMode && styles.darkLinkText]}>
              https://www.termsfeed.com/live/a8e928db-68f9-48ae-b680-81fdce6e8c0d
            </Text>
          </TouchableOpacity>
          <Text style={[styles.text, isDarkMode && styles.darkText]}>
            This website contains the full legal text of our Privacy Policy as generated by TermsFeed Privacy Policy Generator, including all terms, conditions, and detailed explanations of our data handling practices.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  darkContainer: {
    backgroundColor: '#111827',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  lastUpdated: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginTop: 12,
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
    marginBottom: 12,
  },
  bulletText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
    marginBottom: 12,
    marginLeft: 8,
  },
  contactText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1f2937',
    fontWeight: '500',
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  linkText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#3b82f6',
    fontWeight: '500',
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 12,
    textDecorationLine: 'underline',
  },
  darkText: {
    color: '#e5e7eb',
  },
  darkSecondaryText: {
    color: '#9ca3af',
  },
  darkLinkText: {
    color: '#93c5fd',
    backgroundColor: '#1e293b',
  },
  darkContactText: {
    color: '#d1d5db',
    backgroundColor: '#374151',
  },
});

export default PrivacyPolicy;