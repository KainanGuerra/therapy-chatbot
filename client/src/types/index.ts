// Enums
export enum MoodLevel {
  VERY_LOW = 1,
  LOW = 2,
  NEUTRAL = 3,
  GOOD = 4,
  EXCELLENT = 5,
}

export enum ProfessionalType {
  PSYCHOLOGIST = 'psychologist',
  THERAPIST = 'therapist',
  PSYCHIATRIST = 'psychiatrist',
  COUNSELOR = 'counselor',
}

export enum HabitCategory {
  MENTAL_HEALTH = 'mental_health',
  PHYSICAL_HEALTH = 'physical_health',
  WORK_LIFE_BALANCE = 'work_life_balance',
  STRESS_MANAGEMENT = 'stress_management',
  SOCIAL_CONNECTION = 'social_connection',
}

export enum MessageType {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
}

// Interfaces
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
  timestamp?: string | Date;
  createdAt?: string;
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

export interface User {
  id: string;
  email: string;
  name: string;
  preferences?: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface Professional {
  id: string;
  name: string;
  type: ProfessionalType;
  specializations: string[];
  bio: string;
  rating: number;
  reviewCount: number;
  availability: string;
  location: string;
  contactInfo: {
    email?: string;
    phone?: string;
    website?: string;
  };
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messageCount: number;
  lastMessage?: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface SendMessageResponse {
  assistantMessage: ChatMessage;
  moodAnalysis: MoodAnalysis;
  userMessage: {
    content: string;
    createdAt: string; id: string;
    metadata?: object;
  };
  recommendations?: ProfessionalRecommendation;
  habitSuggestions?: HabitSuggestion[];
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface SendMessageForm {
  content: string;
  sessionId?: string;
}