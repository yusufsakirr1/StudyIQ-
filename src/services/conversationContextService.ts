import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserLearningProfileService, ConversationSession, TopicProgress } from './userLearningProfileService';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  language?: 'tr' | 'en';
}

interface ConversationContext {
  sessionId: string;
  userId: string;
  messages: Message[];
  currentTopics: string[];
  userQuestions: string[];
  aiResponses: string[];
  learningObjectives: string[];
  difficultyProgression: number[];
  keywordsDiscussed: Set<string>;
  sessionStartTime: Date;
  lastInteraction: Date;
}

interface SmartContext {
  userProfile: any;
  recentTopics: string[];
  learningPatterns: string[];
  suggestedFollowUps: string[];
  adaptedDifficulty: 'easy' | 'moderate' | 'challenging';
  personalizedPrompt: string;
}

const CONVERSATION_CONTEXT_KEY = 'conversation_context';
const MAX_CONTEXT_MESSAGES = 20;

export class ConversationContextService {
  private static currentContext: ConversationContext | null = null;

  // Konuşma bağlamı başlatma
  static async initializeConversationContext(userId: string): Promise<ConversationContext> {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const context: ConversationContext = {
      sessionId,
      userId,
      messages: [],
      currentTopics: [],
      userQuestions: [],
      aiResponses: [],
      learningObjectives: [],
      difficultyProgression: [1], // Başlangıç seviyesi
      keywordsDiscussed: new Set(),
      sessionStartTime: new Date(),
      lastInteraction: new Date()
    };

    this.currentContext = context;
    await this.saveConversationContext(context);
    
    console.log('🎯 Conversation context initialized:', sessionId);
    return context;
  }

  // Mevcut bağlamı yükleme
  static async loadConversationContext(userId: string): Promise<ConversationContext | null> {
    try {
      const contextData = await AsyncStorage.getItem(`${CONVERSATION_CONTEXT_KEY}_${userId}`);
      if (contextData) {
        const context = JSON.parse(contextData);
        // Date objelerini yeniden oluştur
        context.sessionStartTime = new Date(context.sessionStartTime);
        context.lastInteraction = new Date(context.lastInteraction);
        context.messages = context.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        context.keywordsDiscussed = new Set(context.keywordsDiscussed || []);
        
        this.currentContext = context;
        return context;
      }
    } catch (error) {
      console.error('Error loading conversation context:', error);
    }
    return null;
  }

  // Bağlam kaydetme
  static async saveConversationContext(context: ConversationContext): Promise<void> {
    try {
      const contextToSave = {
        ...context,
        keywordsDiscussed: Array.from(context.keywordsDiscussed)
      };
      
      await AsyncStorage.setItem(
        `${CONVERSATION_CONTEXT_KEY}_${context.userId}`, 
        JSON.stringify(contextToSave)
      );
      
      console.log('💾 Conversation context saved');
    } catch (error) {
      console.error('Error saving conversation context:', error);
    }
  }

  // Mesaj ekleme ve bağlam güncelleme
  static async addMessage(userId: string, message: Message): Promise<void> {
    let context = this.currentContext || await this.loadConversationContext(userId);
    
    if (!context) {
      context = await this.initializeConversationContext(userId);
    }

    // Mesajı ekle
    context.messages.push(message);
    context.lastInteraction = new Date();

    // Sadece son N mesajı tut
    if (context.messages.length > MAX_CONTEXT_MESSAGES) {
      context.messages = context.messages.slice(-MAX_CONTEXT_MESSAGES);
    }

    // İçerik analizi
    await this.analyzeMessageContent(context, message);

    // Bağlamı kaydet
    await this.saveConversationContext(context);
    this.currentContext = context;
  }

  // Mesaj içeriği analizi
  private static async analyzeMessageContent(context: ConversationContext, message: Message): Promise<void> {
    const text = message.text.toLowerCase();
    const words = text.split(/\s+/);

    // Anahtar kelime çıkarımı
    const educationalKeywords = [
      'matematik', 'math', 'integral', 'türev', 'derivative', 'denklem', 'equation',
      'fizik', 'physics', 'kimya', 'chemistry', 'biyoloji', 'biology',
      'tarih', 'history', 'coğrafya', 'geography', 'edebiyat', 'literature',
      'geometri', 'geometry', 'trigonometri', 'trigonometry', 'kalkülüs', 'calculus',
      'cebir', 'algebra', 'istatistik', 'statistics', 'olasılık', 'probability'
    ];

    educationalKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        context.keywordsDiscussed.add(keyword);
      }
    });

    // Konu çıkarımı
    const currentTopics = this.extractTopicsFromMessage(text);
    currentTopics.forEach(topic => {
      if (!context.currentTopics.includes(topic)) {
        context.currentTopics.push(topic);
      }
    });

    // Kullanıcı sorusu mu AI cevabı mı?
    if (message.isUser) {
      context.userQuestions.push(message.text);
      
      // Soru karmaşıklığına göre zorluk seviyesi ayarlama
      const difficulty = this.assessQuestionDifficulty(message.text);
      context.difficultyProgression.push(difficulty);
    } else {
      context.aiResponses.push(message.text);
    }

    // Öğrenme hedefi belirleme
    if (message.isUser && this.isLearningObjective(text)) {
      context.learningObjectives.push(text);
    }
  }

  // Konu çıkarımı
  private static extractTopicsFromMessage(text: string): string[] {
    const topics: string[] = [];
    const topicMap: { [key: string]: string } = {
      'matematik': 'Matematik',
      'math': 'Mathematics',
      'integral': 'İntegraller',
      'türev': 'Türevler',
      'derivative': 'Derivatives',
      'denklem': 'Denklemler',
      'equation': 'Equations',
      'fizik': 'Fizik',
      'physics': 'Physics',
      'kimya': 'Kimya',
      'chemistry': 'Chemistry',
      'geometri': 'Geometri',
      'geometry': 'Geometry'
    };

    Object.entries(topicMap).forEach(([keyword, topic]) => {
      if (text.includes(keyword.toLowerCase())) {
        topics.push(topic);
      }
    });

    return topics;
  }

  // Soru karmaşıklık değerlendirme
  private static assessQuestionDifficulty(text: string): number {
    let difficulty = 1;
    
    // Uzunluk bazlı
    if (text.length > 100) difficulty += 1;
    if (text.length > 200) difficulty += 1;

    // Karmaşık kelimeler
    const complexWords = ['integral', 'derivative', 'differential', 'equation', 'coefficient', 'polynomial'];
    complexWords.forEach(word => {
      if (text.toLowerCase().includes(word)) difficulty += 1;
    });

    // Soru türü
    if (text.includes('neden') || text.includes('why')) difficulty += 1;
    if (text.includes('nasıl') || text.includes('how')) difficulty += 1;
    if (text.includes('ispat') || text.includes('prove')) difficulty += 2;

    return Math.min(difficulty, 10);
  }

  // Öğrenme hedefi kontrolü
  private static isLearningObjective(text: string): boolean {
    const objectiveKeywords = [
      'öğrenmek istiyorum', 'anlamak istiyorum', 'çalışmak istiyorum',
      'want to learn', 'want to understand', 'help me with'
    ];

    return objectiveKeywords.some(keyword => text.toLowerCase().includes(keyword));
  }

  // Akıllı bağlam oluşturma
  static async buildSmartContext(userId: string): Promise<SmartContext> {
    const context = this.currentContext || await this.loadConversationContext(userId);
    const profile = await UserLearningProfileService.getUserProfile(userId);
    const profileEnhancements = await UserLearningProfileService.getPersonalizedPromptEnhancements(userId);

    if (!context) {
      return {
        userProfile: profile,
        recentTopics: [],
        learningPatterns: [],
        suggestedFollowUps: [],
        adaptedDifficulty: 'moderate',
        personalizedPrompt: 'Yeni öğrenci - temel seviye yaklaşım'
      };
    }

    // Son konuları belirle
    const recentTopics = context.currentTopics.slice(-5);
    
    // Öğrenme kalıplarını analiz et
    const learningPatterns = this.analyzeLearningPatterns(context);
    
    // Takip soruları öner
    const suggestedFollowUps = this.generateFollowUpSuggestions(context);
    
    // Zorluk seviyesini adapte et
    const adaptedDifficulty = this.adaptDifficultyLevel(context);
    
    // Kişiselleştirilmiş prompt oluştur
    const personalizedPrompt = this.buildPersonalizedPrompt(context, profile, profileEnhancements);

    return {
      userProfile: profile,
      recentTopics,
      learningPatterns,
      suggestedFollowUps,
      adaptedDifficulty,
      personalizedPrompt
    };
  }

  // Öğrenme kalıpları analizi
  private static analyzeLearningPatterns(context: ConversationContext): string[] {
    const patterns: string[] = [];
    
    // Soru sıklığı
    if (context.userQuestions.length > context.aiResponses.length * 0.8) {
      patterns.push('Aktif soru soran öğrenci');
    }
    
    // Zorluk artışı
    const recentDifficulty = context.difficultyProgression.slice(-3);
    if (recentDifficulty.every((d, i) => i === 0 || d >= recentDifficulty[i - 1])) {
      patterns.push('Artan zorluk seviyesi tercih ediyor');
    }
    
    // Konu odaklanması
    const topicFrequency = context.currentTopics.reduce((acc, topic) => {
      acc[topic] = (acc[topic] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
    
    const dominantTopic = Object.entries(topicFrequency).sort(([, a], [, b]) => b - a)[0];
    if (dominantTopic && dominantTopic[1] > 3) {
      patterns.push(`${dominantTopic[0]} konusunda yoğunlaşıyor`);
    }

    return patterns;
  }

  // Takip soruları önerme
  private static generateFollowUpSuggestions(context: ConversationContext): string[] {
    const suggestions: string[] = [];
    const recentTopics = context.currentTopics.slice(-3);
    
    recentTopics.forEach(topic => {
      switch (topic.toLowerCase()) {
        case 'matematik':
        case 'mathematics':
          suggestions.push('Belirli bir matematik dalını derinlemesine çalışalım mı?');
          suggestions.push('Matematik problemleri çözme tekniklerini görelim mi?');
          break;
        case 'integraller':
        case 'integrals':
          suggestions.push('Farklı integral çözme yöntemlerini deneyelim mi?');
          suggestions.push('İntegrallerin pratik uygulamalarını görmek ister misiniz?');
          break;
        case 'fizik':
        case 'physics':
          suggestions.push('Fizik kanunlarının günlük yaşamdaki örneklerini görelim mi?');
          suggestions.push('Deneysel fizik problemleri çözelim mi?');
          break;
      }
    });

    return suggestions.slice(0, 3); // En fazla 3 öneri
  }

  // Zorluk seviyesi adaptasyonu
  private static adaptDifficultyLevel(context: ConversationContext): 'easy' | 'moderate' | 'challenging' {
    if (context.difficultyProgression.length === 0) return 'moderate';
    
    const averageDifficulty = context.difficultyProgression.reduce((a, b) => a + b, 0) / context.difficultyProgression.length;
    
    if (averageDifficulty <= 3) return 'easy';
    if (averageDifficulty <= 6) return 'moderate';
    return 'challenging';
  }

  // Kişiselleştirilmiş prompt oluşturma
  private static buildPersonalizedPrompt(
    context: ConversationContext, 
    profile: any, 
    enhancements: any
  ): string {
    const sessionInfo = `
Bu oturum bilgileri:
- Oturum süresi: ${Math.round((context.lastInteraction.getTime() - context.sessionStartTime.getTime()) / 1000 / 60)} dakika
- Mesaj sayısı: ${context.messages.length}
- Tartışılan konular: ${context.currentTopics.join(', ') || 'Henüz belirlenmedi'}
- Anahtar kelimeler: ${Array.from(context.keywordsDiscussed).join(', ') || 'Henüz yok'}
- Ortalama soru karmaşıklığı: ${context.difficultyProgression.length > 0 
  ? (context.difficultyProgression.reduce((a, b) => a + b, 0) / context.difficultyProgression.length).toFixed(1)
  : 'Belirlenmedi'}/10

Öğrenme kalıpları:
${this.analyzeLearningPatterns(context).join('\n') || 'Henüz analiz edilmedi'}

${enhancements.userContext}

Öğretim tarzı: ${enhancements.learningStyle}
Zorluk ayarı: ${enhancements.difficultyAdjustment}
${enhancements.topicRecommendations}
    `.trim();

    return sessionInfo;
  }

  // Oturum sonlandırma ve kaydetme
  static async finalizeSession(userId: string): Promise<void> {
    const context = this.currentContext;
    if (!context) return;

    // Oturum bilgilerini kullanıcı profiline kaydet
    const session: ConversationSession = {
      sessionId: context.sessionId,
      userId,
      startTime: context.sessionStartTime,
      endTime: new Date(),
      messagesCount: context.messages.length,
      topicsDiscussed: context.currentTopics,
      learningGoalsAchieved: context.learningObjectives,
      difficultyLevel: context.difficultyProgression.length > 0 
        ? context.difficultyProgression.reduce((a, b) => a + b, 0) / context.difficultyProgression.length 
        : 1,
      keyLearnings: Array.from(context.keywordsDiscussed)
    };

    await UserLearningProfileService.saveConversationSession(session);

    // Konu ilerlemelerini güncelle
    for (const topic of context.currentTopics) {
      const topicProgress: TopicProgress = {
        subject: topic,
        topic: topic,
        level: Math.min(10, Math.round(session.difficultyLevel)),
        lastDiscussed: new Date(),
        questionsAsked: context.userQuestions.length,
        correctAnswers: Math.round(context.userQuestions.length * 0.8), // Varsayılan %80 başarı
        needsReview: session.difficultyLevel > 7,
        confidence: session.difficultyLevel > 7 ? 'high' : session.difficultyLevel > 4 ? 'medium' : 'low'
      };

      await UserLearningProfileService.updateTopicProgress(userId, topicProgress);
    }

    // Profile istatistiklerini güncelle
    const profile = await UserLearningProfileService.getUserProfile(userId);
    if (profile) {
      profile.totalSessions += 1;
      
      // Yeni konuları tercih edilen konulara ekle
      context.currentTopics.forEach(topic => {
        if (!profile.preferredSubjects.includes(topic)) {
          profile.preferredSubjects.push(topic);
        }
      });

      await UserLearningProfileService.saveUserProfile(profile);
    }

    // Geçici context'i temizle
    await AsyncStorage.removeItem(`${CONVERSATION_CONTEXT_KEY}_${userId}`);
    this.currentContext = null;

    console.log('🏁 Session finalized and data saved to profile');
  }

  // Mevcut context'i getir
  static getCurrentContext(): ConversationContext | null {
    return this.currentContext;
  }
}