import functions from '@react-native-firebase/functions';

// Removed MockConversationContextService for speed

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  language?: 'tr' | 'en';
}

interface AITeacherParams {
  userMessage: string;
  conversationHistory: Message[];
  language: 'tr' | 'en';
  userId: string;
}

export const getAITeacherResponse = async ({ userMessage, conversationHistory, language, userId }: AITeacherParams): Promise<string> => {
  console.log('🤖 AI Teacher Service: Starting response generation', {
    userMessage: userMessage.substring(0, 50) + '...',
    language,
    historyLength: conversationHistory.length
  });

  try {
    // Build minimal context for maximum speed
    const contextMessages = buildContextMessages(conversationHistory, userMessage, language);

    // Call Firebase Function with maximum timeout and retry logic
    const openaiProxy = functions().httpsCallable('openaiProxy', { timeout: 30000 }); // 30 saniye maximum timeout
    
    let response;
    let attempts = 0;
    const maxAttempts = 2;
    
    while (attempts < maxAttempts) {
      try {
        response = await Promise.race([
          openaiProxy({ 
            messages: contextMessages,
            maxTokens: 150, // Limit response length for speed
            temperature: 0.7
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), 20000)
          )
        ]);
        break; // Success, exit retry loop
      } catch (retryError: any) {
        attempts++;
        console.log(`Attempt ${attempts} failed:`, retryError.message);
        
        if (attempts >= maxAttempts) {
          throw retryError; // Final attempt failed
        }
        
        // Wait 1 second before retry
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    if (!response.data?.choices?.[0]?.message?.content) {
      throw new Error('No content in AI response');
    }

    const aiContent = response.data.choices[0].message.content;
    console.log('✅ AI Teacher response received, length:', aiContent.length);
    return aiContent.trim();

  } catch (error: any) {
    console.error('💥 Error in AI Teacher service:', error);
    
    // Handle specific Firebase errors with helpful fallback responses
    if (error.code === 'deadline-exceeded' || error.message?.includes('DEADLINE_EXCEEDED')) {
      // Provide a helpful response instead of just error message
      if (language === 'tr') {
        // Analyze the question and provide basic response
        if (userMessage.toLowerCase().includes('merhaba') || userMessage.toLowerCase().includes('selam')) {
          return 'Merhaba! Size nasıl yardımcı olabilirim? Lütfen sorunuzu tekrar sorun.';
        }
        if (userMessage.toLowerCase().includes('matematik') || userMessage.toLowerCase().includes('hesap')) {
          return 'Matematik konusunda yardımcı olmaya hazırım. Lütfen sorunuzu daha detaylı şekilde tekrar sorun.';
        }
        return 'AI servisi şu anda yavaş yanıt veriyor. Lütfen sorunuzu tekrar sorun, daha hızlı yanıt vermeye çalışacağım.';
      } else {
        if (userMessage.toLowerCase().includes('hello') || userMessage.toLowerCase().includes('hi')) {
          return 'Hello! How can I help you today? Please ask your question again.';
        }
        if (userMessage.toLowerCase().includes('math') || userMessage.toLowerCase().includes('calculate')) {
          return 'I\'m ready to help with math. Please ask your question again with more details.';
        }
        return 'AI service is responding slowly. Please ask your question again, I\'ll try to respond faster.';
      }
    }

    if (error.code === 'resource-exhausted') {
      throw new Error(language === 'tr' 
        ? 'Günlük AI mesaj limitinize ulaştınız. Lütfen planınızı yükseltin.'
        : 'You have reached your daily AI message limit. Please upgrade your plan.');
    }

    if (error.code === 'internal') {
      return language === 'tr'
        ? 'Üzgünüm, şu anda teknik bir sorun yaşıyorum. Lütfen biraz sonra tekrar deneyin.'
        : 'Sorry, I\'m experiencing technical difficulties. Please try again later.';
    }

    if (error.code === 'unauthenticated') {
      return language === 'tr'
        ? 'Lütfen giriş yaptığınızdan emin olun.'
        : 'Please make sure you are logged in.';
    }

    if (error.code === 'permission-denied') {
      return language === 'tr'
        ? 'Bu özelliğe erişim izniniz yok.'
        : 'You don\'t have permission to access this feature.';
    }

    if (error.code === 'not-found' || error.message?.includes('not found')) {
      return language === 'tr'
        ? 'AI servisi şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.'
        : 'AI service is currently unavailable. Please try again later.';
    }

    // Handle network errors
    if (error.message?.includes('network') || error.message?.includes('Failed to fetch')) {
      return language === 'tr'
        ? 'Bağlantı sorunu yaşanıyor. Lütfen internet bağlantınızı kontrol edin.'
        : 'Connection issue. Please check your internet connection.';
    }

    // Generic error fallback
    return language === 'tr'
      ? 'Beklenmedik bir hata oluştu. Lütfen tekrar deneyin.'
      : 'An unexpected error occurred. Please try again.';
  }
};

const buildContextMessages = (conversationHistory: Message[], userMessage: string, language: 'tr' | 'en') => {
  // Balanced prompt for speed and quality
  const systemPrompt = language === 'tr' 
    ? 'Sen bir AI öğretmensin. Kısa ve anlaşılır Türkçe cevaplar ver. Önemli noktaları vurgula.'
    : 'You are an AI teacher. Give concise and clear English answers. Focus on key points.';

  const messages = [
    {
      role: 'system',
      content: systemPrompt
    }
  ];

  // Only include last message for minimal context (max speed)
  const lastMessage = conversationHistory[conversationHistory.length - 1];
  if (lastMessage && !lastMessage.isUser && lastMessage.text.length > 30) {
    messages.push({
      role: 'assistant',
      content: lastMessage.text.substring(0, 200) // Very short context
    });
  }

  // Add current user message (with reasonable limit)
  messages.push({
    role: 'user',
    content: userMessage.substring(0, 500) // Increased limit for proper questions
  });

  return messages;
};

// Removed all helper functions for maximum speed