import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useDarkMode } from '../contexts/DarkModeContext';

const TermsOfUse = () => {
  const { isDarkMode } = useDarkMode();

  return (
    <ScrollView style={[styles.container, isDarkMode && styles.darkContainer]}>
      <View style={styles.content}>
        <Text style={[styles.title, isDarkMode && styles.darkText]}>
          Terms of Use
        </Text>
        
        <Text style={[styles.lastUpdated, isDarkMode && styles.darkSecondaryText]}>
          Last updated: December 2024
        </Text>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
            1. Acceptance of Terms
          </Text>
          <Text style={[styles.text, isDarkMode && styles.darkText]}>
            By accessing and using the StudyIQ application ("App"), you accept and agree to be bound by these terms of use. If you do not agree to these terms, please do not use the application.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
            2. Membership Terms and Plan Features
          </Text>
          
          <Text style={[styles.subsectionTitle, isDarkMode && styles.darkText]}>
            2.1 Account Creation
          </Text>
          <Text style={[styles.bulletText, isDarkMode && styles.darkText]}>
            • You must be over 13 years of age{'\n'}
            • A valid email address is required{'\n'}
            • Your account information must be accurate and current{'\n'}
            • Each user may only create one account{'\n'}
            • You may not share your account with others
          </Text>

          <Text style={[styles.subsectionTitle, isDarkMode && styles.darkText]}>
            2.2 Plan Features and Limits
          </Text>
          <Text style={[styles.text, isDarkMode && styles.darkText]}>
            Free Plan:
          </Text>
          <Text style={[styles.bulletText, isDarkMode && styles.darkText]}>
            • 2 detailed notes per day{'\n'}
            • 3 bullet point notes per day{'\n'}
            • Unlimited summaries{'\n'}
            • 50 AI teacher messages per day{'\n'}
            • Basic AI learning features
          </Text>

          <Text style={[styles.text, isDarkMode && styles.darkText]}>
            Pro Plan:
          </Text>
          <Text style={[styles.bulletText, isDarkMode && styles.darkText]}>
            • 20 detailed notes per day{'\n'}
            • 30 bullet point notes per day{'\n'}
            • Unlimited summaries{'\n'}
            • 500 AI teacher messages per day{'\n'}
            • Advanced AI learning (Beta){'\n'}
            • PDF export
          </Text>

          <Text style={[styles.text, isDarkMode && styles.darkText]}>
            Premium Plan:
          </Text>
          <Text style={[styles.bulletText, isDarkMode && styles.darkText]}>
            • 50 detailed notes per day{'\n'}
            • 70 bullet point notes per day{'\n'}
            • Unlimited summaries{'\n'}
            • 1000 AI teacher messages per day{'\n'}
            • Full AI teacher access (Beta){'\n'}
            • AI question generation (COMING SOON){'\n'}
            • AI study plans (COMING SOON){'\n'}
            • Speech-to-text (COMING SOON){'\n'}
            • Priority processing
          </Text>

          <Text style={[styles.subsectionTitle, isDarkMode && styles.darkText]}>
            2.3 Account Security
          </Text>
          <Text style={[styles.bulletText, isDarkMode && styles.darkText]}>
            • You are responsible for keeping your password secure{'\n'}
            • You are responsible for all activities under your account{'\n'}
            • Report suspicious activity to us immediately{'\n'}
            • Update your account information regularly
          </Text>

          <Text style={[styles.subsectionTitle, isDarkMode && styles.darkText]}>
            2.4 Account Closure
          </Text>
          <Text style={[styles.text, isDarkMode && styles.darkText]}>
            You can close your account at any time. When your account is closed:
          </Text>
          <Text style={[styles.bulletText, isDarkMode && styles.darkText]}>
            • All your data will be permanently deleted{'\n'}
            • Your active subscription will be cancelled{'\n'}
            • This action cannot be undone{'\n'}
            • Premium features will be immediately disabled
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
            3. Subscription Terms
          </Text>
          
          <Text style={[styles.subsectionTitle, isDarkMode && styles.darkText]}>
            3.1 Subscription Pricing
          </Text>
          <Text style={[styles.bulletText, isDarkMode && styles.darkText]}>
            • Pro Plan: Monthly $1.99, Yearly $19.99{'\n'}
            • Premium Plan: Monthly $4.99, Yearly $49.99{'\n'}
            • Yearly plans offer 16-17% discount{'\n'}
            • Pro yearly plan: $19.99 instead of $23.88 (16% discount){'\n'}
            • Premium yearly plan: $49.99 instead of $59.88 (17% discount){'\n'}
            • Prices are subject to change{'\n'}
            • Taxes and additional fees may apply according to store policies
          </Text>

          <Text style={[styles.subsectionTitle, isDarkMode && styles.darkText]}>
            3.2 Auto-Renewal
          </Text>
          <Text style={[styles.bulletText, isDarkMode && styles.darkText]}>
            • Subscriptions automatically renew{'\n'}
            • To cancel, take action at least 24 hours before the period ends{'\n'}
            • Renewal fee is charged within 24 hours prior to the end of the current period{'\n'}
            • You can manage subscriptions from your device settings
          </Text>

          <Text style={[styles.subsectionTitle, isDarkMode && styles.darkText]}>
            3.3 Cancellation Rights
          </Text>
          <Text style={[styles.text, isDarkMode && styles.darkText]}>
            You can cancel your subscription at any time:
          </Text>
          <Text style={[styles.bulletText, isDarkMode && styles.darkText]}>
            • Cancellation takes effect immediately{'\n'}
            • Access continues until the end of your paid period{'\n'}
            • Premium features are restricted after cancellation{'\n'}
            • You can resubscribe to restore your features
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
            4. Refund Policy
          </Text>
          
          <Text style={[styles.subsectionTitle, isDarkMode && styles.darkText]}>
            4.1 General Refund Conditions
          </Text>
          <Text style={[styles.bulletText, isDarkMode && styles.darkText]}>
            • Refunds are subject to Apple App Store and Google Play Store policies{'\n'}
            • We do not process direct refunds{'\n'}
            • Contact store support for refund requests{'\n'}
            • Contact our support team for technical issues
          </Text>

          <Text style={[styles.subsectionTitle, isDarkMode && styles.darkText]}>
            4.2 Refund Process
          </Text>
          <Text style={[styles.bulletText, isDarkMode && styles.darkText]}>
            • iOS users: Contact Apple Support{'\n'}
            • Android users: Contact Google Play Support{'\n'}
            • Refund process may take 3-5 business days{'\n'}
            • Premium features are removed when refund is approved
          </Text>

          <Text style={[styles.subsectionTitle, isDarkMode && styles.darkText]}>
            4.3 Non-Refundable Situations
          </Text>
          <Text style={[styles.bulletText, isDarkMode && styles.darkText]}>
            • Issues caused by user error{'\n'}
            • Device compatibility issues{'\n'}
            • Internet connection related problems{'\n'}
            • Accounts suspended due to policy violations
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
            5. User Responsibilities
          </Text>
          
          <Text style={[styles.subsectionTitle, isDarkMode && styles.darkText]}>
            5.1 Legal Use
          </Text>
          <Text style={[styles.bulletText, isDarkMode && styles.darkText]}>
            • You will use the app for legal purposes only{'\n'}
            • You will not infringe copyright{'\n'}
            • You will not share harmful content{'\n'}
            • You will not disturb other users{'\n'}
            • You will not compromise system security
          </Text>

          <Text style={[styles.subsectionTitle, isDarkMode && styles.darkText]}>
            5.2 Content Responsibility
          </Text>
          <Text style={[styles.bulletText, isDarkMode && styles.darkText]}>
            • You are responsible for content you create{'\n'}
            • You are obligated to protect personal data{'\n'}
            • Avoid sharing inappropriate content{'\n'}
            • Follow academic integrity rules
          </Text>

          <Text style={[styles.subsectionTitle, isDarkMode && styles.darkText]}>
            5.3 Account Management
          </Text>
          <Text style={[styles.bulletText, isDarkMode && styles.darkText]}>
            • Keep your account information current{'\n'}
            • Change your password regularly{'\n'}
            • Pay attention to security warnings{'\n'}
            • Report suspicious activities
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
            6. Application Disclaimer
          </Text>
          
          <Text style={[styles.warningText, isDarkMode && styles.darkWarningText]}>
            IMPORTANT: AI Content Warning
          </Text>
          <Text style={[styles.text, isDarkMode && styles.darkText]}>
            Our app uses artificial intelligence technology. By using AI features, you acknowledge and agree that:
          </Text>
          <Text style={[styles.bulletText, isDarkMode && styles.darkText]}>
            • AI responses are automatically generated and may contain errors{'\n'}
            • AI content is not professional educational advice{'\n'}
            • We do not guarantee the accuracy of AI responses{'\n'}
            • Verify all AI information independently{'\n'}
            • We are not responsible for decisions based on AI content{'\n'}
            • AI responses do not reflect our views
          </Text>

          <Text style={[styles.subsectionTitle, isDarkMode && styles.darkText]}>
            6.1 Service Limitations
          </Text>
          <Text style={[styles.bulletText, isDarkMode && styles.darkText]}>
            • Service is provided "as is"{'\n'}
            • We cannot guarantee uninterrupted service{'\n'}
            • Technical failures may occur{'\n'}
            • Access may be restricted during maintenance{'\n'}
            • Take precautions against data loss
          </Text>

          <Text style={[styles.subsectionTitle, isDarkMode && styles.darkText]}>
            6.2 Educational Outcomes
          </Text>
          <Text style={[styles.bulletText, isDarkMode && styles.darkText]}>
            • We do not guarantee academic success{'\n'}
            • Educational outcomes depend on the user{'\n'}
            • The app is only an auxiliary tool{'\n'}
            • Does not replace formal education
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
            7. Service Changes and Termination
          </Text>
          <Text style={[styles.text, isDarkMode && styles.darkText]}>
            With prior notice, we may:
          </Text>
          <Text style={[styles.bulletText, isDarkMode && styles.darkText]}>
            • Change service features{'\n'}
            • Update prices{'\n'}
            • Revise terms of use{'\n'}
            • Suspend or terminate accounts
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
            8. Data Protection and Privacy
          </Text>
          <Text style={[styles.text, isDarkMode && styles.darkText]}>
            Your personal data is protected under our Privacy Policy:
          </Text>
          <Text style={[styles.bulletText, isDarkMode && styles.darkText]}>
            • GDPR compliant data processing{'\n'}
            • Encrypted data storage{'\n'}
            • Secure data transmission{'\n'}
            • Data processing with user consent{'\n'}
            • Recognition of data deletion rights
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
            9. Dispute Resolution
          </Text>
          <Text style={[styles.text, isDarkMode && styles.darkText]}>
            These terms are governed by the laws of the Republic of Turkey. Disputes will be resolved first through amicable settlement, and if unresolvable, through Istanbul courts.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
            10. Contact Information
          </Text>
          <Text style={[styles.text, isDarkMode && styles.darkText]}>
            For questions, please contact us:
          </Text>
          <Text style={[styles.contactText, isDarkMode && styles.darkContactText]}>
            Email: sakiryusuf36@gmail.com{'\n'}
            Subject: StudyIQ Terms of Use Question
          </Text>
        </View>

        <View style={[styles.disclaimerBox, isDarkMode && styles.darkDisclaimerBox]}>
          <Text style={[styles.disclaimerTitle, isDarkMode && styles.darkDisclaimerTitle]}>
            FINAL WARNING
          </Text>
          <Text style={[styles.disclaimerText, isDarkMode && styles.darkDisclaimerText]}>
            This application uses artificial intelligence technology. All AI responses are automated and may contain errors. StudyIQ and its developers assume no responsibility for the accuracy or consequences of AI content. Use at your own discretion and always verify important information independently.
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
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 12,
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
  warningText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ef4444',
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    textAlign: 'center',
  },
  darkWarningText: {
    color: '#fca5a5',
    backgroundColor: '#7f1d1d',
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
  disclaimerBox: {
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  disclaimerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#92400e',
    textAlign: 'center',
    marginBottom: 8,
  },
  disclaimerText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#92400e',
    textAlign: 'center',
    fontWeight: '500',
  },
  darkText: {
    color: '#e5e7eb',
  },
  darkSecondaryText: {
    color: '#9ca3af',
  },
  darkContactText: {
    color: '#d1d5db',
    backgroundColor: '#374151',
  },
  darkDisclaimerBox: {
    backgroundColor: '#374151',
    borderColor: '#6b7280',
  },
  darkDisclaimerTitle: {
    color: '#f3f4f6',
  },
  darkDisclaimerText: {
    color: '#d1d5db',
  },
});

export default TermsOfUse;
