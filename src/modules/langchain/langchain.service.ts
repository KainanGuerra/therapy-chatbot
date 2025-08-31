import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { MoodAnalysis, ProfessionalRecommendation, HabitSuggestion } from '../../common/interfaces';
import { MoodLevel, ProfessionalType, HabitCategory } from '../../common/enums';

@Injectable()
export class LangChainService {
  private readonly logger = new Logger(LangChainService.name);

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
      Analise o estado emocional e o humor da seguinte mensagem em um contexto de ambiente de trabalho.
      
      Mensagem: "{message}"

      Por favor, forneça uma resposta em JSON com:
      level: nível de humor de 1 a 5 (1=muito baixo, 2=baixo, 3=neutro, 4=bom, 5=excelente)
      confidence: nível de confiança de 0 a 1
      keywords: array de palavras-chave emocionais relevantes
      sentiment: "positivo", "negativo" ou "neutro"
      emotions: array de emoções detectadas
      Foque em indicadores de estresse no trabalho, burnout, ansiedade, depressão e bem-estar geral.
    `);

    this.moodAnalysisChain = moodAnalysisPrompt.pipe(this.llm);

    // Professional Recommendation Chain
    const recommendationPrompt = ChatPromptTemplate.fromTemplate(`
      Com base na análise de humor do usuário e no histórico de mensagens, recomende o profissional de saúde mental mais apropriado.
      Nível atual de humor: {moodLevel}
      Mensagens recentes: {messageHistory}
      Preferências do usuário: {preferences}

      Forneça uma resposta em JSON com:
      type: "psicólogo", "terapeuta", "psiquiatra" ou "conselheiro"
      reason: explicação para a recomendação
      urgency: "baixa", "média" ou "alta"
      specializations: array de especializações relevantes

      Considere:
      Psicólogos: para terapia cognitivo-comportamental, avaliação
      Terapeutas: para terapia de conversa, questões de relacionamento
      Psiquiatras: para gerenciamento de medicação, condições graves
      Conselheiros: para apoio geral, questões de ambiente de trabalho
    `);

    this.recommendationChain = recommendationPrompt.pipe(this.llm);

    // Habit Suggestion Chain
    const habitSuggestionPrompt = ChatPromptTemplate.fromTemplate(`
      Sugira hábitos saudáveis com base no humor atual do usuário e no contexto de trabalho.

      Nível de humor: {moodLevel}
      Contexto do usuário: {userContext}
      Hábitos anteriores: {previousHabits}

      Forneça um array em JSON de sugestões de hábitos com:
      id: identificador único
      title: nome do hábito
      description: descrição detalhada
      category: "saúde_mental", "saúde_física", "equilíbrio_vida_trabalho", "gestão_de_estresse" ou "conexão_social"
      difficulty: "fácil", "médio" ou "difícil"
      estimatedTime: tempo necessário (ex.: "5 minutos", "30 minutos")
      benefits: array de benefícios esperados

      Foque em práticas baseadas em evidências que possam ser realizadas em um ambiente de trabalho.
    `);

    this.habitSuggestionChain = habitSuggestionPrompt.pipe(this.llm);

    // Chat Response Chain
    const chatResponsePrompt = ChatPromptTemplate.fromTemplate(`
      Você é um assistente de terapia por IA compassivo, voltado para o bem-estar no ambiente de trabalho. Responda à mensagem do usuário com empatia e orientação útil.     
      
      User message: "{message}"
      User mood level: {moodLevel}
      Conversation context: {context}
      User preferences: {preferences}
      
      Diretrizes:

      Seja empático e não julgador
      Forneça conselhos práticos e adequados ao ambiente de trabalho
      Incentive a busca por ajuda profissional quando necessário
      Use o estilo de comunicação preferido pelo usuário: {communicationStyle}
      Respeite o nível de privacidade: {privacyLevel}
      Não forneça diagnósticos médicos
      Foque em estratégias de enfrentamento e bem-estar
      Responda de maneira solidária e profissional.
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
      this.logger.error('Error analyzing mood:', error);
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
      this.logger.error('Error generating professional recommendation:', error);
      return {
        type: ProfessionalType.COUNSELOR,
        reason: 'General workplace support recommended',
        urgency: 'low',
        specializations: ['workplace wellness', 'stress management'],
      };
    }
  }

  async suggestHabits(moodLevel: MoodLevel, userContext: string, previousHabits: string[]): Promise<HabitSuggestion[]> {
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
      this.logger.error('Error generating habit suggestions:', error);
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
      this.logger.error('Error generating chat response:', JSON.stringify(error));
      return "I understand you're reaching out, and I'm here to support you. Could you tell me a bit more about how you're feeling today?";
    }
  }
}
