import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useDarkMode } from '../contexts/DarkModeContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { SubscriptionType } from '../services/subscriptionService';

const PlanTestScreen = () => {
  const { isDarkMode } = useDarkMode();
  const {
    plan,
    isActive,
    loading,
    usage,
    limits,
    changePlan,
    canPerformAction,
    incrementUsage,
    refreshSubscription,
  } = useSubscription();
  
  const [testing, setTesting] = useState(false);

  const testAction = async (action: 'aiMessages' | 'notesCreated' | 'notesShared' | 'pdfExports' | 'studySessions') => {
    try {
      setTesting(true);
      
      const result = await canPerformAction(action);
      if (result.canPerform) {
        Alert.alert('✅ Allowed', `You can perform ${action}`);
      } else {
        Alert.alert('❌ Not Allowed', result.reason || 'Action not allowed');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setTesting(false);
    }
  };

  const testPlanChange = async (newPlan: SubscriptionType) => {
    try {
      setTesting(true);
      await changePlan(newPlan);
      Alert.alert('✅ Success', `Plan changed to ${newPlan}`);
    } catch (error: any) {
      Alert.alert('❌ Error', error.message);
    } finally {
      setTesting(false);
    }
  };

  const testUsageIncrement = async (action: 'aiMessages' | 'notesCreated' | 'notesShared' | 'pdfExports' | 'studySessions') => {
    try {
      setTesting(true);
      await incrementUsage(action);
      Alert.alert('✅ Success', `${action} usage incremented`);
    } catch (error: any) {
      Alert.alert('❌ Error', error.message);
    } finally {
      setTesting(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? '#121212' : '#f5f5f5',
    },
    content: {
      padding: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: isDarkMode ? '#ffffff' : '#333333',
      marginBottom: 20,
      textAlign: 'center',
    },
    section: {
      backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff',
      padding: 15,
      borderRadius: 10,
      marginBottom: 15,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: isDarkMode ? '#ffffff' : '#333333',
      marginBottom: 10,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 5,
    },
    infoLabel: {
      color: isDarkMode ? '#cccccc' : '#666666',
    },
    infoValue: {
      color: isDarkMode ? '#ffffff' : '#333333',
      fontWeight: 'bold',
    },
    button: {
      backgroundColor: '#007bff',
      padding: 12,
      borderRadius: 8,
      margin: 5,
    },
    buttonText: {
      color: '#ffffff',
      textAlign: 'center',
      fontWeight: 'bold',
    },
    planButton: {
      padding: 12,
      borderRadius: 8,
      margin: 5,
    },
    freeButton: {
      backgroundColor: '#6c757d',
    },
    proButton: {
      backgroundColor: '#28a745',
    },
    premiumButton: {
      backgroundColor: '#ffc107',
    },
    currentPlan: {
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: 'center',
      color: isDarkMode ? '#ffffff' : '#333333',
      marginBottom: 15,
    },
    loader: {
      marginVertical: 20,
    },
  });

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.infoLabel}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Subscription Test</Text>

        {/* Current Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Status</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Plan:</Text>
            <Text style={styles.infoValue}>{plan}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Active:</Text>
            <Text style={styles.infoValue}>{isActive ? 'Yes' : 'No'}</Text>
          </View>
        </View>

        {/* Current Limits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Limits</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>AI Messages:</Text>
            <Text style={styles.infoValue}>
              {limits.aiMessages === -1 ? 'Unlimited' : limits.aiMessages}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Notes Created:</Text>
            <Text style={styles.infoValue}>
              {limits.notesCreated === -1 ? 'Unlimited' : limits.notesCreated}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Notes Shared:</Text>
            <Text style={styles.infoValue}>
              {limits.notesShared === -1 ? 'Unlimited' : limits.notesShared}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>PDF Exports:</Text>
            <Text style={styles.infoValue}>
              {limits.pdfExports === -1 ? 'Unlimited' : limits.pdfExports}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Study Sessions:</Text>
            <Text style={styles.infoValue}>
              {limits.studySessions === -1 ? 'Unlimited' : limits.studySessions}
            </Text>
          </View>
        </View>

        {/* Current Usage */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Usage</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>AI Messages:</Text>
            <Text style={styles.infoValue}>{usage.aiMessages}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Notes Created:</Text>
            <Text style={styles.infoValue}>{usage.notesCreated}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Notes Shared:</Text>
            <Text style={styles.infoValue}>{usage.notesShared}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>PDF Exports:</Text>
            <Text style={styles.infoValue}>{usage.pdfExports}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Study Sessions:</Text>
            <Text style={styles.infoValue}>{usage.studySessions}</Text>
          </View>
        </View>

        {/* Plan Change Test */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Change Plan (Test)</Text>
          <TouchableOpacity
            style={[styles.planButton, styles.freeButton]}
            onPress={() => testPlanChange('free')}
            disabled={testing}>
            <Text style={styles.buttonText}>Switch to FREE</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.planButton, styles.proButton]}
            onPress={() => testPlanChange('pro_monthly_299')}
            disabled={testing}>
            <Text style={styles.buttonText}>Switch to PRO MONTHLY</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.planButton, styles.proButton]}
            onPress={() => testPlanChange('pro_yearly_2990')}
            disabled={testing}>
            <Text style={styles.buttonText}>Switch to PRO YEARLY</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.planButton, styles.premiumButton]}
            onPress={() => testPlanChange('premium_monthly_499')}
            disabled={testing}>
            <Text style={[styles.buttonText, { color: '#000' }]}>Switch to PREMIUM MONTHLY</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.planButton, styles.premiumButton]}
            onPress={() => testPlanChange('premium_yearly_4990')}
            disabled={testing}>
            <Text style={[styles.buttonText, { color: '#000' }]}>Switch to PREMIUM YEARLY</Text>
          </TouchableOpacity>
        </View>

        {/* Test Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test Actions</Text>
          <TouchableOpacity style={styles.button} onPress={() => testAction('aiMessages')} disabled={testing}>
            <Text style={styles.buttonText}>Test AI Message</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => testAction('notesCreated')} disabled={testing}>
            <Text style={styles.buttonText}>Test Create Note</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => testAction('notesShared')} disabled={testing}>
            <Text style={styles.buttonText}>Test Share Note</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => testAction('pdfExports')} disabled={testing}>
            <Text style={styles.buttonText}>Test Export PDF</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => testAction('studySessions')} disabled={testing}>
            <Text style={styles.buttonText}>Test Study Session</Text>
          </TouchableOpacity>
        </View>

        {/* Test Usage Increment */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Increment Usage (Test)</Text>
          <TouchableOpacity style={styles.button} onPress={() => testUsageIncrement('aiMessages')} disabled={testing}>
            <Text style={styles.buttonText}>Increment AI Messages</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => testUsageIncrement('notesCreated')} disabled={testing}>
            <Text style={styles.buttonText}>Increment Notes Created</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => testUsageIncrement('notesShared')} disabled={testing}>
            <Text style={styles.buttonText}>Increment Notes Shared</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => testUsageIncrement('pdfExports')} disabled={testing}>
            <Text style={styles.buttonText}>Increment PDF Exports</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => testUsageIncrement('studySessions')} disabled={testing}>
            <Text style={styles.buttonText}>Increment Study Sessions</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={refreshSubscription} disabled={testing}>
          <Text style={styles.buttonText}>Refresh Data</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default PlanTestScreen;