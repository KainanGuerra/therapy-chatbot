import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { MoodAnalysis, ProfessionalRecommendation, HabitSuggestion } from '../../common/interfaces';
import { MoodLevel, ProfessionalType, HabitCategory } from '../../common/enums';

@Injectable()
export class LangChainService {
  private llm: ChatOpenAI;
  private moodAnalysisChain: any;
  private recommendationChain: any;
  private habitSuggestionChain: any;
  private chatResponseChain: any;

  constructor(private configService: ConfigService) {
    this.initializeLLM();
    this.initializeChains();
  }

  private initializeLLM() {
    const langchainConfig = this.configService.get('langchain');
    this.llm = new ChatOpenAI({
      openAIApiKey: langchainConfig.openaiApiKey,
      modelName: langchainConfig.modelName,
      temperature: langchainConfig.temperature,
      maxTokens: langchainConfig.maxTokens,
    });
  }

  private initializeChains() {
    // Mood Analysis Chain
    const moodAnalysisPrompt = ChatPromptTemplate.fromTemplate(`
      Analyze the emotional state and mood of the following message from a workplace context.
      
      Message: "{message}"
      
      Please provide a JSON response with:
      - level: mood level from 1-5 (1=very low, 2=low, 3=neutral, 4=good, 5=excellent)
      - confidence: confidence score from 0-1
      - keywords: array of relevant emotional keywords
      - sentiment: "positive", "negative", or "neutral"
      - emotions: array of detected emotions
      
      Focus on workplace stress, burnout, anxiety, depression, and general wellbeing indicators.
    `);

    this.moodAnalysisChain = moodAnalysisPrompt.pipe(this.llm);

    // Professional Recommendation Chain
    const recommendationPrompt = ChatPromptTemplate.fromTemplate(`
      Based on the user's mood analysis and message history, recommend the most appropriate mental health professional.
      
      Current mood level: {moodLevel}
      Recent messages: {messageHistory}
      User preferences: {preferences}
      
      Provide a JSON response with:
      - type: "psychologist", "therapist", "psychiatrist", or "counselor"
      - reason: explanation for the recommendation
      - urgency: "low", "medium", or "high"
      - specializations: array of relevant specializations
      
      Consider:
      - Psychologists: for cognitive behavioral therapy, assessment
      - Therapists: for talk therapy, relationship issues
      - Psychiatrists: for medication management, severe conditions
      - Counselors: for general support, workplace issues
    `);

    this.recommendationChain = recommendationPrompt.pipe(this.llm);

    // Habit Suggestion Chain
    const habitSuggestionPrompt = ChatPromptTemplate.fromTemplate(`
      Suggest healthy habits based on the user's current mood and workplace context.
      
      Mood level: {moodLevel}
      User context: {userContext}
      Previous habits: {previousHabits}
      
      Provide a JSON array of habit suggestions with:
      - id: unique identifier
      - title: habit name
      - description: detailed description
      - category: "mental_health", "physical_health", "work_life_balance", "stress_management", or "social_connection"
      - difficulty: "easy", "medium", or "hard"
      - estimatedTime: time required (e.g., "5 minutes", "30 minutes")
      - benefits: array of expected benefits
      
      Focus on evidence-based practices that can be done in a workplace environment.
    `);

    this.habitSuggestionChain = habitSuggestionPrompt.pipe(this.llm);

    // Chat Response Chain
    const chatResponsePrompt = ChatPromptTemplate.fromTemplate(`
      You are a compassionate AI therapy assistant for workplace wellness. Respond to the user's message with empathy and helpful guidance.
      
      User message: "{message}"
      User mood level: {moodLevel}
      Conversation context: {context}
      User preferences: {preferences}
      
      Guidelines:
      - Be empathetic and non-judgmental
      - Provide practical workplace-appropriate advice
      - Encourage professional help when needed
      - Use the user's preferred communication style: {communicationStyle}
      - Respect privacy level: {privacyLevel}
      - Don't provide medical diagnoses
      - Focus on coping strategies and wellness
      
      Respond in a supportive, professional manner.
    `);

    this.chatResponseChain = chatResponsePrompt.pipe(this.llm);
  }

  async analyzeMood(message: string): Promise<MoodAnalysis> {
    try {
      const response = await this.moodAnalysisChain.invoke({ message });
      const analysis = JSON.parse(response.content);
      
      return {
        level: analysis.level as MoodLevel,
        confidence: analysis.confidence,
        keywords: analysis.keywords,
        sentiment: analysis.sentiment,
        emotions: analysis.emotions,
      };
    } catch (error) {
      console.error('Error analyzing mood:', error);
      // Return default analysis if AI fails
      return {
        level: MoodLevel.NEUTRAL,
        confidence: 0.5,
        keywords: [],
        sentiment: 'neutral',
        emotions: [],
      };
    }
  }

  async recommendProfessional(
    moodLevel: MoodLevel,
    messageHistory: string[],
    preferences: any,
  ): Promise<ProfessionalRecommendation> {
    try {
      const response = await this.recommendationChain.invoke({
        moodLevel,
        messageHistory: messageHistory.join('\n'),
        preferences: JSON.stringify(preferences),
      });
      
      const recommendation = JSON.parse(response.content);
      
      return {
        type: recommendation.type as ProfessionalType,
        reason: recommendation.reason,
        urgency: recommendation.urgency,
        specializations: recommendation.specializations,
      };
    } catch (error) {
      console.error('Error generating professional recommendation:', error);
      return {
        type: ProfessionalType.COUNSELOR,
        reason: 'General workplace support recommended',
        urgency: 'low',
        specializations: ['workplace wellness', 'stress management'],
      };
    }
  }

  async suggestHabits(
    moodLevel: MoodLevel,
    userContext: string,
    previousHabits: string[],
  ): Promise<HabitSuggestion[]> {
    try {
      const response = await this.habitSuggestionChain.invoke({
        moodLevel,
        userContext,
        previousHabits: previousHabits.join(', '),
      });
      
      const suggestions = JSON.parse(response.content);
      
      return suggestions.map((suggestion: any) => ({
        id: suggestion.id,
        title: suggestion.title,
        description: suggestion.description,
        category: suggestion.category as HabitCategory,
        difficulty: suggestion.difficulty,
        estimatedTime: suggestion.estimatedTime,
        benefits: suggestion.benefits,
      }));
    } catch (error) {
      console.error('Error generating habit suggestions:', error);
      return [];
    }
  }

  async generateChatResponse(
    message: string,
    moodLevel: MoodLevel,
    context: string,
    preferences: any,
  ): Promise<string> {
    try {
      const response = await this.chatResponseChain.invoke({
        message,
        moodLevel,
        context,
        preferences: JSON.stringify(preferences),
        communicationStyle: preferences.communicationStyle || 'empathetic',
        privacyLevel: preferences.privacyLevel || 'medium',
      });
      
      return response.content;
    } catch (error) {
      console.error('Error generating chat response:', error);
      return "I understand you're reaching out, and I'm here to support you. Could you tell me a bit more about how you're feeling today?";
    }
  }
}