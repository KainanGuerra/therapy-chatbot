import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatSession, ChatMessage, MoodEntry, User } from '../../entities';
import { LangChainModule } from '../langchain/langchain.module';

@Module({
  imports: [TypeOrmModule.forFeature([ChatSession, ChatMessage, MoodEntry, User]), LangChainModule],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}
