import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';
import MaterialIcon from '@react-native-vector-icons/material-icons';

const {width, height} = Dimensions.get('window');

interface OnboardingProps {
  navigation: {
    navigate: (screen: string) => void;
    setIsFirstTime: (value: boolean) => void;
  };
}

const OnboardingScreen = ({navigation}: OnboardingProps) => {
  const [currentPage, setCurrentPage] = useState(0);

  const onboardingData = [
    {
      id: 1,
      title: 'Welcome to StudyIQ',
      description: 'Transform your messy notes into organized, beautiful study materials with the power of AI.',
      icon: 'auto-awesome',
      color: '#4F46E5',
    },
    {
      id: 2,
      title: 'AI-Powered Organization',
      description: 'Our smart AI analyzes your notes and creates summaries, bullet points, and detailed explanations automatically.',
      icon: 'psychology',
      color: '#7C3AED',
    },
    {
      id: 3,
      title: 'Study Smarter, Not Harder',
      description: 'Save time and improve your learning with perfectly formatted notes that help you retain information better.',
      icon: 'school',
      color: '#059669',
    },
  ];

  const handleNext = () => {
    if (currentPage < onboardingData.length - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      // Mark onboarding as completed and go to auth
      navigation.setIsFirstTime(false);
      navigation.navigate('Login');
    }
  };

  const handleSkip = () => {
    // Mark onboarding as completed and go to auth
    navigation.setIsFirstTime(false);
    navigation.navigate('Login');
  };

  const currentData = onboardingData[currentPage];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={[styles.iconContainer, {backgroundColor: currentData.color}]}>
          <MaterialIcon name={currentData.icon} size={80} color="white" />
        </View>

        <Text style={styles.title}>{currentData.title}</Text>
        <Text style={styles.description}>{currentData.description}</Text>
      </View>

      <View style={styles.bottom}>
        <View style={styles.pagination}>
          {onboardingData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentPage ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {currentPage === onboardingData.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <MaterialIcon 
            name={currentPage === onboardingData.length - 1 ? 'arrow-forward' : 'arrow-forward'} 
            size={20} 
            color="white" 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'flex-end',
    marginBottom: 40,
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1c1f',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  bottom: {
    alignItems: 'center',
    gap: 32,
  },
  pagination: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  activeDot: {
    backgroundColor: '#000000',
    width: 24,
  },
  inactiveDot: {
    backgroundColor: '#cbd5e1',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 160,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default OnboardingScreen;