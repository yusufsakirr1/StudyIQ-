import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserLearningProfile {
  userId: string;
  preferredLanguage: 'tr' | 'en';
  learningLevel: 'beginner' | 'intermediate' | 'advanced';
  preferredSubjects: string[];
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading' | 'mixed';
  difficultyPreference: 'easy' | 'moderate' | 'challenging';
  sessionGoals: string[];
  strengths: string[];
  weakAreas: string[];
  lastActiveTopics: TopicProgress[];
  totalSessions: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TopicProgress {
  subject: string;
  topic: string;
  level: number; // 1-10 scale
  lastDiscussed: Date;
  questionsAsked: number;
  correctAnswers: number;
  needsReview: boolean;
  confidence: 'low' | 'medium' | 'high';
}

export interface ConversationSession {
  sessionId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  messagesCount: number;
  topicsDiscussed: string[];
  learningGoalsAchieved: string[];
  difficultyLevel: number;
  userSatisfaction?: number; // 1-5 scale
  keyLearnings: string[];
}

const USER_PROFILE_KEY = 'user_learning_profile';
const CONVERSATION_HISTORY_KEY = 'conversation_sessions';

export class UserLearningProfileService {
  // Kullanıcı profili yönetimi
  static async getUserProfile(userId: string): Promise<UserLearningProfile | null> {
    try {
      const profileData = await AsyncStorage.getItem(`${USER_PROFILE_KEY}_${userId}`);
      if (profileData) {
        const profile = JSON.parse(profileData);
        // Date objelerini yeniden oluştur
        profile.createdAt = new Date(profile.createdAt);
        profile.updatedAt = new Date(profile.updatedAt);
        profile.lastActiveTopics = profile.lastActiveTopics.map((topic: any) => ({
          ...topic,
          lastDiscussed: new Date(topic.lastDiscussed)
        }));
        return profile;
      }
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  static async createUserProfile(userId: string, initialData?: Partial<UserLearningProfile>): Promise<UserLearningProfile> {
    const defaultProfile: UserLearningProfile = {
      userId,
      preferredLanguage: 'tr',
      learningLevel: 'beginner',
      preferredSubjects: [],
      learningStyle: 'mixed',
      difficultyPreference: 'moderate',
      sessionGoals: [],
      strengths: [],
      weakAreas: [],
      lastActiveTopics: [],
      totalSessions: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...initialData
    };

    await this.saveUserProfile(defaultProfile);
    return defaultProfile;
  }

  static async saveUserProfile(profile: UserLearningProfile): Promise<void> {
    try {
      profile.updatedAt = new Date();
      await AsyncStorage.setItem(`${USER_PROFILE_KEY}_${profile.userId}`, JSON.stringify(profile));
      console.log('✅ User profile saved successfully');
    } catch (error) {
      console.error('Error saving user profile:', error);
    }
  }

  static async updateLearningLevel(userId: string, newLevel: UserLearningProfile['learningLevel']): Promise<void> {
    const profile = await this.getUserProfile(userId);
    if (profile) {
      profile.learningLevel = newLevel;
      await this.saveUserProfile(profile);
    }
  }

  static async addPreferredSubject(userId: string, subject: string): Promise<void> {
    const profile = await this.getUserProfile(userId);
    if (profile && !profile.preferredSubjects.includes(subject)) {
      profile.preferredSubjects.push(subject);
      await this.saveUserProfile(profile);
    }
  }

  static async updateTopicProgress(userId: string, topicProgress: TopicProgress): Promise<void> {
    const profile = await this.getUserProfile(userId);
    if (profile) {
      const existingIndex = profile.lastActiveTopics.findIndex(
        t => t.subject === topicProgress.subject && t.topic === topicProgress.topic
      );

      if (existingIndex >= 0) {
        profile.lastActiveTopics[existingIndex] = topicProgress;
      } else {
        profile.lastActiveTopics.push(topicProgress);
        // Keep only last 20 topics
        profile.lastActiveTopics = profile.lastActiveTopics
          .sort((a, b) => b.lastDiscussed.getTime() - a.lastDiscussed.getTime())
          .slice(0, 20);
      }

      await this.saveUserProfile(profile);
    }
  }

  // Konuşma oturumu yönetimi
  static async saveConversationSession(session: ConversationSession): Promise<void> {
    try {
      const sessions = await this.getConversationSessions(session.userId);
      sessions.push(session);
      
      // Keep only last 50 sessions
      const recentSessions = sessions
        .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
        .slice(0, 50);

      await AsyncStorage.setItem(
        `${CONVERSATION_HISTORY_KEY}_${session.userId}`, 
        JSON.stringify(recentSessions)
      );
      
      console.log('✅ Conversation session saved');
    } catch (error) {
      console.error('Error saving conversation session:', error);
    }
  }

  static async getConversationSessions(userId: string): Promise<ConversationSession[]> {
    try {
      const sessionsData = await AsyncStorage.getItem(`${CONVERSATION_HISTORY_KEY}_${userId}`);
      if (sessionsData) {
        const sessions = JSON.parse(sessionsData);
        return sessions.map((session: any) => ({
          ...session,
          startTime: new Date(session.startTime),
          endTime: session.endTime ? new Date(session.endTime) : undefined
        }));
      }
      return [];
    } catch (error) {
      console.error('Error getting conversation sessions:', error);
      return [];
    }
  }

  // Öğrenme analizi ve öneriler
  static async analyzeUserProgress(userId: string): Promise<{
    overallLevel: number;
    strongSubjects: string[];
    weakSubjects: string[];
    recommendedTopics: string[];
    nextDifficultyLevel: 'easy' | 'moderate' | 'challenging';
  }> {
    const profile = await this.getUserProfile(userId);
    const sessions = await this.getConversationSessions(userId);

    if (!profile) {
      return {
        overallLevel: 1,
        strongSubjects: [],
        weakSubjects: [],
        recommendedTopics: [],
        nextDifficultyLevel: 'easy'
      };
    }

    // Genel seviye hesaplama
    const overallLevel = profile.lastActiveTopics.length > 0 
      ? Math.round(profile.lastActiveTopics.reduce((acc, topic) => acc + topic.level, 0) / profile.lastActiveTopics.length)
      : 1;

    // Güçlü konular (yüksek confidence ve level)
    const strongSubjects = profile.lastActiveTopics
      .filter(topic => topic.confidence === 'high' && topic.level >= 7)
      .map(topic => topic.subject)
      .filter((subject, index, arr) => arr.indexOf(subject) === index);

    // Zayıf konular (düşük confidence veya needsReview)
    const weakSubjects = profile.lastActiveTopics
      .filter(topic => topic.confidence === 'low' || topic.needsReview)
      .map(topic => topic.subject)
      .filter((subject, index, arr) => arr.indexOf(subject) === index);

    // Önerilen konular (son zamanlarda çalışılmamış ama ilgi alanında)
    const recommendedTopics = profile.preferredSubjects
      .filter(subject => !profile.lastActiveTopics.some(topic => 
        topic.subject === subject && 
        topic.lastDiscussed > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Son 7 gün
      ));

    // Sonraki zorluk seviyesi önerisi
    const nextDifficultyLevel = overallLevel >= 8 ? 'challenging' : 
                               overallLevel >= 5 ? 'moderate' : 'easy';

    return {
      overallLevel,
      strongSubjects,
      weakSubjects,
      recommendedTopics,
      nextDifficultyLevel
    };
  }

  // Akıllı öğrenme önerileri
  static async getPersonalizedPromptEnhancements(userId: string): Promise<{
    userContext: string;
    learningStyle: string;
    difficultyAdjustment: string;
    topicRecommendations: string;
  }> {
    const profile = await this.getUserProfile(userId);
    const analysis = await this.analyzeUserProgress(userId);

    if (!profile) {
      return {
        userContext: 'Yeni öğrenci',
        learningStyle: 'Genel öğretim yaklaşımı',
        difficultyAdjustment: 'Başlangıç seviyesi',
        topicRecommendations: 'Temel konulardan başla'
      };
    }

    const userContext = `
Kullanıcı Profili:
- Seviye: ${profile.learningLevel} (Genel: ${analysis.overallLevel}/10)
- Tercih edilen konular: ${profile.preferredSubjects.join(', ') || 'Belirlenmedi'}
- Güçlü alanlar: ${analysis.strongSubjects.join(', ') || 'Henüz belirlenmedi'}
- Gelişim alanları: ${analysis.weakSubjects.join(', ') || 'Henüz belirlenmedi'}
- Toplam oturum: ${profile.totalSessions}
    `.trim();

    const learningStyleMap = {
      'visual': 'Görsel örnekler, diagramlar ve şemalar kullan',
      'auditory': 'Sesli açıklamalar ve tartışma odaklı yaklaşım',
      'kinesthetic': 'Pratik örnekler ve hands-on aktiviteler',
      'reading': 'Detaylı yazılı açıklamalar ve okuma materyalleri',
      'mixed': 'Farklı öğrenme yöntemlerini harmanlayın'
    };

    const difficultyMap = {
      'easy': 'Basit ve temel kavramlar, adım adım açıklama',
      'moderate': 'Orta seviye karmaşıklık, çeşitli örnekler',
      'challenging': 'İleri seviye problemler, derinlemesine analiz'
    };

    return {
      userContext,
      learningStyle: learningStyleMap[profile.learningStyle],
      difficultyAdjustment: difficultyMap[analysis.nextDifficultyLevel],
      topicRecommendations: analysis.recommendedTopics.length > 0 
        ? `Önerilen konular: ${analysis.recommendedTopics.join(', ')}`
        : 'Kullanıcının ilgi alanlarını keşfet'
    };
  }
}