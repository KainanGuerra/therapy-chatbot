import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfessionalsService } from './professionals.service';
import { ProfessionalsController } from './professionals.controller';
import { Professional, MoodEntry, User } from '../../entities';
import { LangChainModule } from '../langchain/langchain.module';

@Module({
  imports: [TypeOrmModule.forFeature([Professional, MoodEntry, User]), LangChainModule],
  controllers: [ProfessionalsController],
  providers: [ProfessionalsService],
  exports: [ProfessionalsService],
})
export class ProfessionalsModule {}
