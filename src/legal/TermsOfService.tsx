import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useDarkMode } from '../contexts/DarkModeContext';

const TermsOfService = () => {
  const { isDarkMode } = useDarkMode();

  return (
    <ScrollView style={[styles.container, isDarkMode && styles.darkContainer]}>
      <View style={styles.content}>
        <Text style={[styles.title, isDarkMode && styles.darkText]}>
          Terms of Service
        </Text>
        
        <Text style={[styles.lastUpdated, isDarkMode && styles.darkSecondaryText]}>
          Last updated: December 2024
        </Text>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
            1. Acceptance of Terms
          </Text>
          <Text style={[styles.text, isDarkMode && styles.darkText]}>
            By accessing and using StudyIQ ("the App"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
            2. Description of Service
          </Text>
          <Text style={[styles.text, isDarkMode && styles.darkText]}>
            StudyIQ is an educational mobile application that provides AI-powered study assistance, note-taking capabilities, and learning tools. The service includes both free and premium subscription tiers.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
            3. AI Disclaimer and Limitations
          </Text>
          <Text style={[styles.warningText, isDarkMode && styles.darkWarningText]}>
            IMPORTANT: AI-Generated Content Disclaimer
          </Text>
          <Text style={[styles.text, isDarkMode && styles.darkText]}>
            Our app uses artificial intelligence (AI) technology to provide educational assistance. By using our AI features, you acknowledge and agree that:
          </Text>
          <Text style={[styles.bulletText, isDarkMode && styles.darkText]}>
            • AI responses are generated automatically and may contain errors, inaccuracies, or misleading information{'\n'}
            • AI-generated content is not a substitute for professional educational advice{'\n'}
            • We do not guarantee the accuracy, completeness, or reliability of AI responses{'\n'}
            • You should verify all AI-generated information independently{'\n'}
            • We are not responsible for any decisions made based on AI-generated content{'\n'}
            • AI responses do not represent our views, opinions, or official positions
          </Text>
          <Text style={[styles.warningText, isDarkMode && styles.darkWarningText]}>
            YOU USE AI FEATURES AT YOUR OWN RISK AND RESPONSIBILITY.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
            4. User Accounts and Responsibilities
          </Text>
          <Text style={[styles.text, isDarkMode && styles.darkText]}>
            You are responsible for:
          </Text>
          <Text style={[styles.bulletText, isDarkMode && styles.darkText]}>
            • Maintaining the security of your account credentials{'\n'}
            • All activities that occur under your account{'\n'}
            • Using the service in compliance with applicable laws{'\n'}
            • Not sharing your account with others{'\n'}
            • Providing accurate and current information
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
            5. Prohibited Uses
          </Text>
          <Text style={[styles.text, isDarkMode && styles.darkText]}>
            You may not use our service:
          </Text>
          <Text style={[styles.bulletText, isDarkMode && styles.darkText]}>
            • For any unlawful purpose or to solicit unlawful acts{'\n'}
            • To violate any international, federal, provincial, or state regulations or laws{'\n'}
            • To transmit, or procure the sending of, any advertising or promotional material{'\n'}
            • To impersonate or attempt to impersonate the company or other users{'\n'}
            • To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate{'\n'}
            • To submit false or misleading information{'\n'}
            • To engage in any other conduct that restricts or inhibits anyone's use of the service
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
            6. Subscription and Payment Terms
          </Text>
          
          <Text style={[styles.subsectionTitle, isDarkMode && styles.darkText]}>
            6.1 Subscription Plans
          </Text>
          <Text style={[styles.text, isDarkMode && styles.darkText]}>
            StudyIQ offers various subscription plans including monthly and yearly premium subscriptions. Each plan provides access to premium features as described in the app.
          </Text>

          <Text style={[styles.subsectionTitle, isDarkMode && styles.darkText]}>
            6.2 Payment and Billing
          </Text>
          <Text style={[styles.bulletText, isDarkMode && styles.darkText]}>
            • Payment will be charged to your Apple ID account or Google Play account upon confirmation of purchase{'\n'}
            • Subscription automatically renews unless auto-renew is turned off at least 24 hours before the end of the current period{'\n'}
            • Account will be charged for renewal within 24 hours prior to the end of the current period{'\n'}
            • You can manage and cancel subscriptions in your device's Account Settings{'\n'}
            • Price increases will be communicated 30 days in advance
          </Text>

          <Text style={[styles.subsectionTitle, isDarkMode && styles.darkText]}>
            6.3 Free Trial
          </Text>
          <Text style={[styles.text, isDarkMode && styles.darkText]}>
            We may offer free trial periods. If you do not cancel before the trial ends, you will be charged the subscription fee. You can cancel anytime during the trial period without charge.
          </Text>

          <Text style={[styles.subsectionTitle, isDarkMode && styles.darkText]}>
            6.4 Refund Policy
          </Text>
          <Text style={[styles.bulletText, isDarkMode && styles.darkText]}>
            • Refunds are handled by Apple App Store or Google Play Store according to their policies{'\n'}
            • We do not provide direct refunds outside of store policies{'\n'}
            • Subscription fees are non-refundable except as required by applicable law{'\n'}
            • Contact Apple or Google Support for refund requests{'\n'}
            • Refund does not guarantee future access to premium features
          </Text>

          <Text style={[styles.subsectionTitle, isDarkMode && styles.darkText]}>
            6.5 Cancellation Rights
          </Text>
          <Text style={[styles.text, isDarkMode && styles.darkText]}>
            You have the right to cancel your subscription at any time. Cancellation will take effect at the end of your current billing period. You will continue to have access to premium features until the end of the paid period.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
            7. Intellectual Property Rights
          </Text>
          <Text style={[styles.text, isDarkMode && styles.darkText]}>
            The service and its original content, features, and functionality are and will remain the exclusive property of StudyIQ and its licensors. You retain ownership of content you create, but grant us a license to use it for providing our services.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
            8. Limitation of Liability
          </Text>
          <Text style={[styles.warningText, isDarkMode && styles.darkWarningText]}>
            DISCLAIMER OF WARRANTIES AND LIMITATION OF LIABILITY
          </Text>
          <Text style={[styles.text, isDarkMode && styles.darkText]}>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW:
          </Text>
          <Text style={[styles.bulletText, isDarkMode && styles.darkText]}>
            • THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND{'\n'}
            • WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED{'\n'}
            • WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES{'\n'}
            • OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT PAID BY YOU IN THE 12 MONTHS PRECEDING THE CLAIM{'\n'}
            • WE ARE NOT RESPONSIBLE FOR ANY EDUCATIONAL OUTCOMES OR ACADEMIC PERFORMANCE
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
            9. Indemnification
          </Text>
          <Text style={[styles.text, isDarkMode && styles.darkText]}>
            You agree to defend, indemnify, and hold harmless StudyIQ and its officers, directors, employees, and agents from and against any and all claims, damages, obligations, losses, liabilities, costs or debt, and expenses (including but not limited to attorney's fees).
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
            10. Termination
          </Text>
          <Text style={[styles.text, isDarkMode && styles.darkText]}>
            We may terminate or suspend your account and bar access to the service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever, including without limitation if you breach the Terms.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
            11. Governing Law
          </Text>
          <Text style={[styles.text, isDarkMode && styles.darkText]}>
            These Terms shall be interpreted and governed by the laws of Turkey, without regard to its conflict of law provisions. Any disputes shall be resolved in the courts of Turkey.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
            12. Changes to Terms
          </Text>
          <Text style={[styles.text, isDarkMode && styles.darkText]}>
            We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
            13. Contact Information
          </Text>
          <Text style={[styles.text, isDarkMode && styles.darkText]}>
            If you have any questions about these Terms of Service, please contact us:
          </Text>
          <Text style={[styles.contactText, isDarkMode && styles.darkContactText]}>
            Email: sakiryusuf36@gmail.com{'\n'}
            Subject: StudyIQ Terms of Service Inquiry
          </Text>
        </View>

        <View style={[styles.disclaimerBox, isDarkMode && styles.darkDisclaimerBox]}>
          <Text style={[styles.disclaimerTitle, isDarkMode && styles.darkDisclaimerTitle]}>
            FINAL DISCLAIMER
          </Text>
          <Text style={[styles.disclaimerText, isDarkMode && styles.darkDisclaimerText]}>
            This application uses artificial intelligence technology. All AI-generated responses are automated and may contain errors. StudyIQ and its developers assume no responsibility for the accuracy or consequences of AI-generated content. Use at your own discretion and always verify important information independently.
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

export default TermsOfService;