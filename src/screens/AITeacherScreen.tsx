import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import MaterialIcon from '@react-native-vector-icons/material-icons';
import { useDarkMode } from '../contexts/DarkModeContext';
import { getAITeacherResponse } from '../services/aiTeacherService';
import { useSubscription } from '../contexts/SubscriptionContext';
import { PlanChangeService } from '../services/planChangeService';
import { SubscriptionService } from '../services/subscriptionService';
import Modal from '../components/Modal';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  language?: 'tr' | 'en';
}

// Dil algılama fonksiyonu
const detectLanguage = (text: string): 'tr' | 'en' => {
  const turkishChars = /[çğıöşüÇĞIİÖŞÜ]/;
  const turkishWords = ['merhaba', 'nasıl', 'neden', 'ne', 'hangi', 'kim', 'nerede', 'ne zaman', 'nasılsın', 'teşekkür', 'lütfen', 'evet', 'hayır', 'tamam', 'iyi', 'kötü', 'güzel', 'harika', 'mükemmel', 'öğrenmek', 'çalışmak', 'ders', 'konu', 'soru', 'cevap', 'açıklama', 'yardım', 'anlamak', 'bilgi', 'öğretmen', 'öğrenci'];
  
  const lowerText = text.toLowerCase();
  
  // Türkçe karakter kontrolü
  if (turkishChars.test(text)) {
    return 'tr';
  }
  
  // Türkçe kelime kontrolü
  const hasTurkishWords = turkishWords.some(word => lowerText.includes(word));
  if (hasTurkishWords) {
    return 'tr';
  }
  
  // Varsayılan olarak İngilizce
  return 'en';
};

// İçerik filtreleme fonksiyonu - Sadece gerçekten uygunsuz içerikleri engeller
const isContentAppropriate = (text: string): { isAppropriate: boolean; reason?: string } => {
  const lowerText = text.toLowerCase();
  
  // Sadece gerçekten uygunsuz kelimeler (Türkçe) - Küfür ve hakaret odaklı
  const inappropriateWordsTR = [
    // Küfür ve hakaret
    'amk', 'amına', 'sikik', 'orospu', 'piç', 'götün', 'yarrak', 'taşak', 'sik',
    'aptal', 'salak', 'gerizekalı', 'dangalak', 'mal', 'beyinsiz', 'ahmak',
    'kahpe', 'kancık', 'pezevenk', 'ibne', 'puşt', 'götveren',
    // Ciddi tehditler
    'öldürürüm', 'öldür', 'gebertir', 'gebertin', 'vururum', 'döverim',
    'tecavüz', 'taciz', 'zorla', 'saldır',
    // Aşırı cinsel içerik
    'porno', 'mastürbasyon', 'orgazm', 'vajina', 'penis'
  ];
  
  // Sadece gerçekten uygunsuz kelimeler (İngilizce) - Küfür ve hakaret odaklı
  const inappropriateWordsEN = [
    // Küfür ve hakaret
    'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'damn', 'hell',
    'stupid', 'idiot', 'moron', 'retard', 'dumbass', 'jackass',
    'whore', 'slut', 'cunt', 'dick', 'cock', 'pussy',
    // Ciddi tehditler
    'kill you', 'murder', 'rape', 'assault', 'violence', 'harm you',
    // Aşırı cinsel içerik
    'porn', 'masturbate', 'orgasm', 'vagina', 'penis'
  ];
  
  // Sadece uygunsuz kelime kontrolü - eğitim kontrolü kaldırıldı
  const hasInappropriateWords = [...inappropriateWordsTR, ...inappropriateWordsEN].some(word => 
    lowerText.includes(word)
  );
  
  if (hasInappropriateWords) {
    return { isAppropriate: false, reason: 'inappropriate_content' };
  }
  
  // Artık her şey uygun - sadece küfür ve hakaret engellendi
  return { isAppropriate: true };
};

const AITeacherScreen = ({ navigation }: any) => {
  const { isDarkMode } = useDarkMode();
  const { isActive, plan, iapAvailable } = useSubscription();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your AI teacher. I'm here to help you with academic subjects, provide explanations, and answer your questions. What subject would you like to study?",
      isUser: false,
      timestamp: new Date(),
      language: 'en',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const [userId] = useState('user_001'); // In real app, get from auth context

  useEffect(() => {
    // Auto scroll to bottom when new messages are added
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  useEffect(() => {
    // Initialize user profile and conversation context
    const initializeUserContext = async () => {
      try {
        // User context initialization (simplified)
        console.log('✅ User context initialized for:', userId);
        
      } catch (error) {
        console.error('Error initializing user context:', error);
      }
    };

    initializeUserContext();

    // Cleanup when component unmounts
    return () => {
      console.log('🧹 Cleaning up AI Teacher session');
    };
  }, [userId]);

  const detectLanguage = (text: string): 'tr' | 'en' => {
    const turkishWords = ['merhaba', 'selam', 'nasıl', 'nedir', 'matematik', 'fizik', 'kimya', 'biyoloji', 'tarih', 'coğrafya', 'edebiyat', 'türkçe', 'türk', 'soru', 'cevap', 'yardım', 'teşekkür', 'lütfen', 'evet', 'hayır', 'iyi', 'kötü', 'büyük', 'küçük', 'güzel', 'çirkin', 'öğretmen', 'öğrenci', 'okul', 'ders', 'kitap', 'kalem', 'defter', 'tahta', 'çalışmak', 'öğrenmek', 'anlamak', 'bilmek', 'görmek', 'duymak', 'gelmek', 'gitmek', 'yapmak', 'etmek', 'olmak', 'bulunmak', 'kalmak', 'vermek', 'almak', 'söylemek', 'demek', 'açıkla', 'anlat', 'göster', 'öğret', 'integral', 'türev', 'denklem', 'formül', 'hesap', 'sayı', 'rakam', 'bana', 'sana', 'ona', 'beni', 'seni', 'onu', 'benim', 'senin', 'onun', 'için', 'ile', 'dan', 'den', 'ta', 'te', 'da', 'de', 'gibi', 'kadar', 'sonra', 'önce', 'şimdi', 'dün', 'yarın', 'çok', 'az', 'biraz', 'hiç', 'her', 'bazı', 'tüm', 'hep', 'daha', 'en', 'çok', 'pek', 'oldukça', 'gerçekten', 'acaba', 'belki', 'mutlaka', 'kesinlikle', 'tabii', 'elbette', 'aslında', 'sanırım', 'galiba', 'herhalde', 'yoksa', 'eğer', 'ama', 'fakat', 'ancak', 'lakin', 'çünkü', 'nedeniyle', 'dolayısıyla', 'böylece', 'sayesinde', 'rağmen', 'karşın', 'algoritma', 'kod', 'program', 'yazılım', 'python', 'hesaplayan', 'anlat', 'anlatır', 'misin', 'mısın', 'musun', 'müsün'];
    
    const lowerText = text.toLowerCase();
    const turkishCount = turkishWords.filter(word => lowerText.includes(word)).length;
    
    const detectedLanguage = turkishCount > 0 ? 'tr' : 'en';
    
    console.log(`🔤 Language Detection:`, {
      text: text.substring(0, 50) + '...',
      turkishWordsFound: turkishCount,
      detectedLanguage,
      foundWords: turkishWords.filter(word => lowerText.includes(word))
    });
    
    return detectedLanguage;
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    // İçerik kontrolü - sadece küfür ve hakaret engellenir
    const contentCheck = isContentAppropriate(inputText.trim());
    if (!contentCheck.isAppropriate) {
      const detectedLanguage = detectLanguage(inputText.trim());
      
      Alert.alert(
        detectedLanguage === 'tr' ? 'Uygunsuz İçerik' : 'Inappropriate Content',
        detectedLanguage === 'tr' 
          ? 'Lütfen saygılı bir dil kullanın.'
          : 'Please use respectful language.',
        [{ text: detectedLanguage === 'tr' ? 'Tamam' : 'OK' }]
      );
      return;
    }

    // Check if user can send AI message
    try {
      const canSend = await PlanChangeService.canPerformAction('aiMessage');
      if (!canSend.canPerform) {
        Alert.alert(
          'Limit Reached',
          canSend.reason || 'You have reached your daily AI message limit.',
          [{ text: 'OK' }]
        );
        return;
      }
    } catch (error) {
      console.error('Usage check failed:', error);
      // Continue anyway if usage check fails
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
      language: detectLanguage(inputText.trim()),
    };

    // Immediately clear input and show typing indicator for better UX
    setInputText('');
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Generate AI response with conversation context (optimized)
    const generateResponse = async () => {
      try {
        const detectedLanguage = userMessage.language || 'en';
        
        // Use ultra-optimized AI service call
        const aiText = await getAITeacherResponse({
          userMessage: userMessage.text,
          conversationHistory: [], // No history for maximum speed
          language: detectedLanguage,
          userId: userId
        });
        
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: aiText,
          isUser: false,
          timestamp: new Date(),
          language: detectedLanguage,
        };
        
        setMessages(prev => [...prev, aiResponse]);
        
        // Track AI message usage IMMEDIATELY after successful response
        try {
          await SubscriptionService.incrementUsage('aiMessages');
          console.log('📊 AI message usage tracked successfully');
        } catch (usageError) {
          console.error('❌ Failed to track AI usage:', usageError);
        }
        
        console.log('🤖 AI response logged');
      } catch (error) {
        console.error('AI Teacher error:', error);
        
        // Fallback to mock response if AI service fails
        const detectedLanguage = detectLanguage(inputText.trim());
        const fallbackText = detectedLanguage === 'tr' 
          ? 'Üzgünüm, şu anda AI servisi kullanılamıyor. Lütfen tekrar deneyin.' 
          : 'Sorry, AI service is currently unavailable. Please try again.';
          
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: fallbackText,
          isUser: false,
          timestamp: new Date(),
          language: detectedLanguage,
        };
        
        setMessages(prev => [...prev, aiResponse]);
      } finally {
        setIsTyping(false);
      }
    };
    
    generateResponse();
  };




  const handleQuickAction = async (action: string) => {
    // Check subscription type and AI usage limit for quick actions too
    try {
      const subscription = await SubscriptionService.getUserSubscription();
      
      const usageCheck = await SubscriptionService.checkAIUsageLimit();
      if (!usageCheck.canUse) {
        if (subscription.type === 'premium') {
          Alert.alert(
            'Error',
            'Something went wrong with your Premium subscription. Please try again.',
            [{ text: 'OK' }]
          );
          return;
        } else {
          setShowLimitModal(true);
          return;
        }
      }
    } catch (error) {
      console.error('Error checking AI usage limit:', error);
      Alert.alert('Error', 'Unable to check usage limit. Please try again.');
      return;
    }

    let message = '';
    switch (action) {
      case 'summarize':
        message = "Can you summarize the key points of what we've discussed?";
        break;
      case 'explain':
        message = "Can you explain this in simpler terms?";
        break;
      case 'questions':
        message = "Can you generate some practice questions on this topic?";
        break;
    }
    
    if (message) {
      setInputText(message);
      // Auto-send the quick action message
      setTimeout(async () => {
        await handleSendMessage();
      }, 100);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = (message: Message) => (
    <View
      key={message.id}
      style={[
        styles.messageContainer,
        message.isUser ? styles.userMessageContainer : styles.aiMessageContainer,
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          message.isUser ? styles.userBubble : styles.aiBubble,
          isDarkMode && (message.isUser ? styles.darkUserBubble : styles.darkAiBubble),
        ]}
      >
        <Text
          style={[
            styles.messageText,
            message.isUser ? styles.userMessageText : styles.aiMessageText,
            isDarkMode && (message.isUser ? styles.darkUserMessageText : styles.darkAiMessageText),
          ]}
        >
          {message.text}
        </Text>
        <Text
          style={[
            styles.timestamp,
            message.isUser ? styles.userTimestamp : (isDarkMode ? styles.darkTimestamp : styles.aiTimestamp),
          ]}
        >
          {formatTime(message.timestamp)}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      {/* Header */}
      <View style={[styles.header, isDarkMode && styles.darkHeader]}>
        <View style={styles.headerContent}>
          <MaterialIcon 
            name="psychology" 
            size={28} 
            color={isDarkMode ? "#ffffff" : "#000000"} 
          />
          <View style={styles.headerText}>
            <Text style={[styles.headerTitle, isDarkMode && styles.darkText]}>
              AI Teacher
            </Text>
            <View style={[styles.betaTag, isDarkMode && styles.darkBetaTag]}>
              <Text style={styles.betaTagText}>BETA</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Chat Area */}
      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map(renderMessage)}
          
          {isTyping && (
            <View style={[styles.messageContainer, styles.aiMessageContainer]}>
              <View style={[styles.messageBubble, styles.aiBubble, isDarkMode && styles.darkAiBubble]}>
                <View style={styles.typingIndicator}>
                  <View style={[styles.typingDot, isDarkMode && styles.darkTypingDot]} />
                  <View style={[styles.typingDot, isDarkMode && styles.darkTypingDot]} />
                  <View style={[styles.typingDot, isDarkMode && styles.darkTypingDot]} />
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.quickActionButton, isDarkMode && styles.darkQuickActionButton]}
            onPress={() => handleQuickAction('summarize')}
          >
            <Text style={[styles.quickActionText, isDarkMode && styles.darkQuickActionText]}>
              Summarize
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickActionButton, isDarkMode && styles.darkQuickActionButton]}
            onPress={() => handleQuickAction('explain')}
          >
            <Text style={[styles.quickActionText, isDarkMode && styles.darkQuickActionText]}>
              Explain Simply
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickActionButton, isDarkMode && styles.darkQuickActionButton]}
            onPress={() => handleQuickAction('questions')}
          >
            <Text style={[styles.quickActionText, isDarkMode && styles.darkQuickActionText]}>
              Generate Questions
            </Text>
          </TouchableOpacity>
        </View>

        {/* Input Area */}
        <View style={[styles.inputContainer, isDarkMode && styles.darkInputContainer]}>
          <View style={styles.galleryIconContainer}>
            <TouchableOpacity
              style={styles.galleryButton}
              disabled={true}
            >
              <MaterialIcon 
                name="photo-library" 
                size={24} 
                color={isDarkMode ? "#6b7280" : "#9ca3af"} 
              />
              <View style={[styles.soonLabel, isDarkMode && styles.darkSoonLabel]}>
                <Text style={styles.soonText}>SOON</Text>
              </View>
            </TouchableOpacity>
          </View>
          <TextInput
            style={[styles.textInput, isDarkMode && styles.darkTextInput]}
            placeholder="Type your question..."
            placeholderTextColor={isDarkMode ? "#6b7280" : "#9ca3af"}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSendMessage}
            disabled={!inputText.trim()}
          >
            <MaterialIcon 
              name="send" 
              size={20} 
              color="white" 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* AI Limit Modal */}
      <Modal
        visible={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        title="AI Teacher Premium Feature"
        subtitle="You have reached your daily limit of 5 AI conversations. Upgrade to Premium for unlimited AI Teacher access!"
        icon="🤖"
        iconColor="#8b5cf6"
        buttons={[
          {
            text: 'Cancel',
            onPress: () => setShowLimitModal(false),
            style: 'cancel'
          },
          {
            text: 'Upgrade to Premium',
            onPress: () => {
              setShowLimitModal(false);
              navigation.navigate('Upgrade');
            },
            style: 'default',
            primary: true
          }
        ]}
      />
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
  headerText: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1c1f',
  },
  darkText: {
    color: '#ffffff',
  },
  betaTag: {
    backgroundColor: '#ff6b35',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  darkBetaTag: {
    backgroundColor: '#ff8c42',
  },
  betaTagText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  aiMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  userBubble: {
    backgroundColor: '#3b82f6',
    borderBottomRightRadius: 4,
  },
  darkUserBubble: {
    backgroundColor: '#1d4ed8',
  },
  aiBubble: {
    backgroundColor: '#f1f5f9',
    borderBottomLeftRadius: 4,
  },
  darkAiBubble: {
    backgroundColor: '#374151',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: 'white',
  },
  darkUserMessageText: {
    color: 'white',
  },
  aiMessageText: {
    color: '#1a1c1f',
  },
  darkAiMessageText: {
    color: '#ffffff',
  },
  timestamp: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'right',
  },
  userTimestamp: {
    color: '#000000',
    fontWeight: '600',
  },
  aiTimestamp: {
    color: '#6b7280',
  },
  darkTimestamp: {
    color: '#9ca3af',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6b7280',
  },
  darkTypingDot: {
    backgroundColor: '#9ca3af',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  quickActionButton: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  darkQuickActionButton: {
    backgroundColor: '#374151',
    borderColor: '#4b5563',
  },
  quickActionText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  darkQuickActionText: {
    color: '#d1d5db',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  darkInputContainer: {
    backgroundColor: '#1f2937',
    borderTopColor: '#374151',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1a1c1f',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    maxHeight: 100,
    marginRight: 8,
  },
  darkTextInput: {
    backgroundColor: '#374151',
    color: '#ffffff',
    borderColor: '#4b5563',
  },
  sendButton: {
    backgroundColor: '#000000',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryIconContainer: {
    position: 'relative',
    marginRight: 8,
  },
  galleryButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  soonLabel: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ff6b35',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
    minWidth: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  darkSoonLabel: {
    backgroundColor: '#ff8c42',
  },
  soonText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});

export default AITeacherScreen;
