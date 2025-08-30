import { MoodLevel, ProfessionalType, HabitCategory, MessageType } from '../enums';

export interface MoodAnalysis {
  level: MoodLevel;
  confidence: number;
  keywords: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  emotions: string[];
}

export interface ProfessionalRecommendation {
  type: ProfessionalType;
  reason: string;
  urgency: 'low' | 'medium' | 'high';
  specializations: string[];
}

export interface HabitSuggestion {
  id: string;
  title: string;
  description: string;
  category: HabitCategory;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: string;
  benefits: string[];
}

export interface UserPreferences {
  communicationStyle?: string;
  privacyLevel?: string;
  preferredProfessionalType?: ProfessionalType | string;
  habitCategories?: string[];
  notificationSettings?: {
    email: boolean;
    push: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
  };
}

export interface ChatMessage {
  id?: string;
  role?: 'user' | 'assistant';
  type?: MessageType;
  content: string;
  timestamp: Date;
  userId?: string;
  moodAnalysis?: MoodAnalysis;
}

export interface ChatContext {
  sessionId: string;
  userId: string;
  messages: ChatMessage[];
  currentMood?: MoodLevel;
  preferences?: UserPreferences;
  moodHistory?: MoodAnalysis[];
  lastActivity?: Date;
}