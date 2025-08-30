import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { ChatSession, ChatMessage, MoodEntry, User } from '../../entities';
import { RedisService } from '../redis/redis.service';
import { LangChainService } from '../langchain/langchain.service';
import { SendMessageDto, CreateSessionDto } from './dto/chat.dto';
import { ChatContext, MoodAnalysis } from '../../common/interfaces';
import { MessageType, MoodLevel } from '../../common/enums';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatSession)
    private chatSessionRepository: Repository<ChatSession>,
    @InjectRepository(ChatMessage)
    private chatMessageRepository: Repository<ChatMessage>,
    @InjectRepository(MoodEntry)
    private moodEntryRepository: Repository<MoodEntry>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private redisService: RedisService,
    private langChainService: LangChainService,
  ) {}

  async createSession(userId: string, createSessionDto: CreateSessionDto): Promise<ChatSession> {
    const session = this.chatSessionRepository.create({
      userId,
      title: createSessionDto.title || 'New Chat Session',
    });

    return this.chatSessionRepository.save(session);
  }

  async getUserSessions(userId: string): Promise<ChatSession[]> {
    return this.chatSessionRepository.find({
      where: { userId, isActive: true },
      order: { updatedAt: 'DESC' },
      take: 20,
    });
  }

  async getSessionMessages(sessionId: string, userId: string): Promise<ChatMessage[]> {
    // Verify session belongs to user
    const session = await this.chatSessionRepository.findOne({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new Error('Session not found or access denied');
    }

    return this.chatMessageRepository.find({
      where: { sessionId },
      order: { createdAt: 'ASC' },
    });
  }

  async sendMessage(userId: string, sendMessageDto: SendMessageDto): Promise<{
    userMessage: ChatMessage;
    assistantMessage: ChatMessage;
    moodAnalysis: MoodAnalysis;
  }> {
    let { sessionId, content } = sendMessageDto;

    // Create new session if not provided
    if (!sessionId) {
      const newSession = await this.createSession(userId, { title: 'New Chat' });
      sessionId = newSession.id;
    }

    // Get user preferences
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    // Analyze mood
    const moodAnalysis = await this.langChainService.analyzeMood(content);

    // Save user message
    const userMessage = this.chatMessageRepository.create({
      sessionId,
      content,
      type: MessageType.USER,
      moodAnalysis: {
        level: moodAnalysis.level,
        confidence: moodAnalysis.confidence,
        keywords: moodAnalysis.keywords,
        sentiment: moodAnalysis.sentiment,
        emotions: moodAnalysis.emotions,
      },
    });

    const savedUserMessage = await this.chatMessageRepository.save(userMessage);

    // Save mood entry
    await this.saveMoodEntry(userId, moodAnalysis);

    // Get chat context
    const context = await this.getChatContext(userId, sessionId);

    // Generate AI response
    const aiResponse = await this.langChainService.generateChatResponse(
      content,
      moodAnalysis.level,
      this.buildContextString(context),
      user.preferences,
    );

    // Save assistant message
    const assistantMessage = this.chatMessageRepository.create({
      sessionId,
      content: aiResponse,
      type: MessageType.ASSISTANT,
    });

    const savedAssistantMessage = await this.chatMessageRepository.save(assistantMessage);

    // Update chat context in Redis
    await this.updateChatContext(userId, sessionId, savedUserMessage, savedAssistantMessage, moodAnalysis);

    // Update session timestamp
    await this.chatSessionRepository.update(sessionId, { updatedAt: new Date() });

    return {
      userMessage: savedUserMessage,
      assistantMessage: savedAssistantMessage,
      moodAnalysis,
    };
  }

  private async getChatContext(userId: string, sessionId: string): Promise<ChatContext> {
    // Try to get from Redis first
    let context = await this.redisService.getChatContext(userId, sessionId);

    if (!context) {
      // Build context from database
      const messages = await this.getSessionMessages(sessionId, userId);
      const user = await this.userRepository.findOne({ where: { id: userId } });
      
      context = {
        userId,
        sessionId,
        messages: messages.map(msg => ({
          id: msg.id,
          userId,
          content: msg.content,
          type: msg.type,
          timestamp: msg.createdAt,
          moodAnalysis: msg.moodAnalysis,
        })),
        moodHistory: [],
        lastActivity: new Date(),
        preferences: user?.preferences || {
          habitCategories: [],
          communicationStyle: 'empathetic',
          privacyLevel: 'medium',
        },
      };
    }

    return context;
  }

  private async updateChatContext(
    userId: string,
    sessionId: string,
    userMessage: ChatMessage,
    assistantMessage: ChatMessage,
    moodAnalysis: MoodAnalysis,
  ): Promise<void> {
    const context = await this.getChatContext(userId, sessionId);

    // Add new messages to context
    context.messages.push(
      {
        id: userMessage.id,
        userId,
        content: userMessage.content,
        type: userMessage.type,
        timestamp: userMessage.createdAt,
        moodAnalysis,
      },
      {
        id: assistantMessage.id,
        userId,
        content: assistantMessage.content,
        type: assistantMessage.type,
        timestamp: assistantMessage.createdAt,
      },
    );

    // Add mood to history
    context.moodHistory.push(moodAnalysis);

    // Keep only last 20 messages and 10 mood entries
    context.messages = context.messages.slice(-20);
    context.moodHistory = context.moodHistory.slice(-10);

    context.lastActivity = new Date();

    // Save to Redis
    await this.redisService.setChatContext(userId, sessionId, context);
  }

  private buildContextString(context: ChatContext): string {
    const recentMessages = context.messages.slice(-5);
    return recentMessages
      .map(msg => `${msg.type}: ${msg.content}`)
      .join('\n');
  }

  private async saveMoodEntry(userId: string, moodAnalysis: MoodAnalysis): Promise<void> {
    const moodEntry = this.moodEntryRepository.create({
      userId,
      level: moodAnalysis.level,
      confidence: moodAnalysis.confidence,
      keywords: moodAnalysis.keywords,
      sentiment: moodAnalysis.sentiment,
      emotions: moodAnalysis.emotions,
    });

    await this.moodEntryRepository.save(moodEntry);
  }

  async getMoodHistory(userId: string, days: number = 30): Promise<MoodEntry[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.moodEntryRepository.find({
      where: {
        userId,
        createdAt: startDate,
      },
      order: { createdAt: 'ASC' },
    });
  }

  async deleteSession(sessionId: string, userId: string): Promise<void> {
    const session = await this.chatSessionRepository.findOne({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new Error('Session not found or access denied');
    }

    // Soft delete
    await this.chatSessionRepository.update(sessionId, { isActive: false });

    // Remove from Redis
    await this.redisService.deleteChatContext(userId, sessionId);
  }
}