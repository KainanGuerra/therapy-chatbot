import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HabitsService } from './habits.service';
import { HabitsController } from './habits.controller';
import { HabitTracking, MoodEntry, User } from '../../entities';
import { LangChainModule } from '../langchain/langchain.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([HabitTracking, MoodEntry, User]),
    LangChainModule,
  ],
  controllers: [HabitsController],
  providers: [HabitsService],
  exports: [HabitsService],
})
export class HabitsModule {}