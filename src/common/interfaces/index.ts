import { MoodLevel, ProfessionalType, MessageType, HabitCategory } from '../enums';

export interface ChatMessage {
  id: string;
  userId: string;
  content: string;
  type: MessageType;
  timestamp: Date;
  moodAnalysis?: MoodAnalysis;
}

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

export interface ChatContext {
  userId: string;
  sessionId: string;
  messages: ChatMessage[];
  moodHistory: MoodAnalysis[];
  lastActivity: Date;
  preferences: UserPreferences;
}

export interface UserPreferences {
  preferredProfessionalType?: ProfessionalType;
  habitCategories: HabitCategory[];
  communicationStyle: 'formal' | 'casual' | 'empathetic';
  privacyLevel: 'low' | 'medium' | 'high';
}