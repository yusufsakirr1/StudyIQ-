import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import MaterialIcon from '@react-native-vector-icons/material-icons';
import { useDarkMode } from '../contexts/DarkModeContext';

const AIDisclaimer = () => {
  const { isDarkMode } = useDarkMode();

  return (
    <ScrollView style={[styles.container, isDarkMode && styles.darkContainer]}>
      <View style={styles.content}>
        {/* Warning Header */}
        <View style={[styles.warningHeader, isDarkMode && styles.darkWarningHeader]}>
          <MaterialIcon 
            name="warning" 
            size={32} 
            color="#f59e0b" 
            style={styles.warningIcon}
          />
          <Text style={[styles.title, isDarkMode && styles.darkText]}>
            AI Teacher Disclaimer
          </Text>
          <Text style={[styles.subtitle, isDarkMode && styles.darkSecondaryText]}>
            Important Information About AI-Generated Content
          </Text>
        </View>

        {/* Critical Warning Box */}
        <View style={styles.criticalWarningBox}>
          <Text style={styles.criticalWarningTitle}>
            ⚠️ CRITICAL DISCLAIMER ⚠️
          </Text>
          <Text style={styles.criticalWarningText}>
            ALL CONTENT PROVIDED BY OUR AI TEACHER IS GENERATED AUTOMATICALLY BY ARTIFICIAL INTELLIGENCE AND MAY CONTAIN ERRORS, INACCURACIES, OR MISLEADING INFORMATION. WE ASSUME NO RESPONSIBILITY FOR THE ACCURACY OR CONSEQUENCES OF AI-GENERATED RESPONSES.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
            🤖 What is Our AI Teacher?
          </Text>
          <Text style={[styles.text, isDarkMode && styles.darkText]}>
            Our AI Teacher is powered by OpenAI's language models and is designed to assist with educational questions and learning. However, it is an automated system that generates responses based on patterns in training data, not human expertise.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
            🚫 What We Do NOT Guarantee
          </Text>
          <Text style={[styles.bulletText, isDarkMode && styles.darkText]}>
            • <Text style={styles.bold}>Accuracy:</Text> AI responses may contain factual errors{'\n'}
            • <Text style={styles.bold}>Completeness:</Text> Information may be incomplete or oversimplified{'\n'}
            • <Text style={styles.bold}>Currency:</Text> Information may be outdated{'\n'}
            • <Text style={styles.bold}>Academic Standards:</Text> Content may not meet academic requirements{'\n'}
            • <Text style={styles.bold}>Professional Advice:</Text> Not a substitute for qualified educational guidance{'\n'}
            • <Text style={styles.bold}>Consistency:</Text> Similar questions may receive different answers
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
            ⚡ Known Limitations
          </Text>
          <Text style={[styles.bulletText, isDarkMode && styles.darkText]}>
            • May generate plausible-sounding but incorrect information{'\n'}
            • Cannot access real-time information or current events{'\n'}
            • May exhibit biases present in training data{'\n'}
            • Cannot perform calculations with 100% accuracy{'\n'}
            • May misunderstand context or nuance in questions{'\n'}
            • Cannot provide personalized medical, legal, or professional advice
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
            ✅ Recommended Best Practices
          </Text>
          <Text style={[styles.bulletText, isDarkMode && styles.darkText]}>
            • Always verify important information from authoritative sources{'\n'}
            • Use AI responses as starting points, not final answers{'\n'}
            • Cross-reference information with textbooks and reliable sources{'\n'}
            • Consult with qualified teachers for critical academic work{'\n'}
            • Be skeptical of complex calculations or technical details{'\n'}
            • Don't rely solely on AI for exam preparation or assignments
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
            🎓 Educational Use Guidelines
          </Text>
          <Text style={[styles.text, isDarkMode && styles.darkText]}>
            Our AI Teacher is best used for:
          </Text>
          <Text style={[styles.bulletText, isDarkMode && styles.darkText]}>
            • <Text style={styles.bold}>Concept Exploration:</Text> Understanding basic concepts and ideas{'\n'}
            • <Text style={styles.bold}>Study Assistance:</Text> Getting help with homework questions{'\n'}
            • <Text style={styles.bold}>Practice Problems:</Text> Working through example problems{'\n'}
            • <Text style={styles.bold}>Brainstorming:</Text> Generating ideas and approaches{'\n'}
            • <Text style={styles.bold}>Language Practice:</Text> Improving writing and communication
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
            🚨 When NOT to Use AI Teacher
          </Text>
          <Text style={[styles.bulletText, isDarkMode && styles.darkText]}>
            • For final exam answers without verification{'\n'}
            • For academic papers or assignments submitted for grades{'\n'}
            • For medical, legal, or safety-critical information{'\n'}
            • When institutional policies prohibit AI assistance{'\n'}
            • For standardized test preparation as sole resource{'\n'}
            • When accurate, up-to-date information is critical
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
            📊 Data Processing Notice
          </Text>
          <Text style={[styles.text, isDarkMode && styles.darkText]}>
            When you interact with our AI Teacher:
          </Text>
          <Text style={[styles.bulletText, isDarkMode && styles.darkText]}>
            • Your messages are processed by OpenAI's servers{'\n'}
            • Conversations may be temporarily stored for processing{'\n'}
            • We do not permanently store your AI conversations{'\n'}
            • Data processing is subject to OpenAI's privacy policy{'\n'}
            • No personal information is intentionally shared with AI responses
          </Text>
        </View>

        {/* Beta Notice */}
        <View style={[styles.betaNotice, isDarkMode && styles.darkBetaNotice]}>
          <Text style={[styles.betaTitle, isDarkMode && styles.darkText]}>
            🧪 BETA Feature Notice
          </Text>
          <Text style={[styles.betaText, isDarkMode && styles.darkText]}>
            Our AI Teacher feature is currently in BETA testing. This means:
          </Text>
          <Text style={[styles.bulletText, isDarkMode && styles.darkText]}>
            • Features may change or be discontinued{'\n'}
            • Performance may vary{'\n'}
            • We're actively improving the system{'\n'}
            • Your feedback helps us enhance the experience
          </Text>
        </View>

        {/* Legal Disclaimer */}
        <View style={styles.legalBox}>
          <Text style={styles.legalTitle}>
            LEGAL DISCLAIMER
          </Text>
          <Text style={styles.legalText}>
            StudyIQ and its developers, officers, employees, and affiliates hereby disclaim any and all responsibility and liability for the accuracy, completeness, or usefulness of any AI-generated content. By using the AI Teacher feature, you acknowledge that you do so at your own risk and that StudyIQ shall not be held liable for any direct, indirect, incidental, consequential, or punitive damages arising from your use of or reliance on AI-generated content.
          </Text>
        </View>

        {/* Contact Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
            📧 Questions or Concerns?
          </Text>
          <Text style={[styles.text, isDarkMode && styles.darkText]}>
            If you have questions about our AI features or this disclaimer:
          </Text>
          <Text style={[styles.contactText, isDarkMode && styles.darkContactText]}>
            Email: sakiryusuf36@gmail.com{'\n'}
            Subject: StudyIQ AI Teacher Inquiry
          </Text>
        </View>

        {/* Final Warning */}
        <View style={styles.finalWarningBox}>
          <Text style={styles.finalWarningText}>
            Remember: AI is a tool to assist learning, not replace critical thinking. Always think independently and verify information before making important decisions.
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
  warningHeader: {
    backgroundColor: '#fffbeb',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#f59e0b',
  },
  darkWarningHeader: {
    backgroundColor: '#451a03',
  },
  warningIcon: {
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  criticalWarningBox: {
    backgroundColor: '#fef2f2',
    borderColor: '#ef4444',
    borderWidth: 3,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  criticalWarningTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 12,
  },
  criticalWarningText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#991b1b',
    textAlign: 'center',
    fontWeight: '600',
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
  bold: {
    fontWeight: 'bold',
  },
  betaNotice: {
    backgroundColor: '#f3e8ff',
    borderColor: '#8b5cf6',
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  darkBetaNotice: {
    backgroundColor: '#581c87',
  },
  betaTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7c3aed',
    marginBottom: 8,
  },
  betaText: {
    fontSize: 16,
    color: '#6b21a8',
    marginBottom: 8,
  },
  legalBox: {
    backgroundColor: '#f3f4f6',
    borderColor: '#d1d5db',
    borderWidth: 2,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  legalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  legalText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#374151',
    textAlign: 'justify',
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
  darkContactText: {
    backgroundColor: '#374151',
    color: '#ffffff',
  },
  finalWarningBox: {
    backgroundColor: '#ecfdf5',
    borderColor: '#10b981',
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
  },
  finalWarningText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#047857',
    textAlign: 'center',
    fontWeight: '600',
  },
  darkText: {
    color: '#ffffff',
  },
  darkSecondaryText: {
    color: '#9ca3af',
  },
});

export default AIDisclaimer;