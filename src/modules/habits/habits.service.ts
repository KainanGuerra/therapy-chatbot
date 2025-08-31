import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HabitTracking, MoodEntry, User } from '../../entities';
import { LangChainService } from '../langchain/langchain.service';
import { RedisService } from '../redis/redis.service';
import { CreateHabitDto, UpdateHabitDto, CompleteHabitDto } from './dto/habit.dto';
import { HabitCategory, MoodLevel } from '../../common/enums';
import { HabitSuggestion } from '../../common/interfaces';

@Injectable()
export class HabitsService {
  constructor(
    @InjectRepository(HabitTracking)
    private habitTrackingRepository: Repository<HabitTracking>,
    @InjectRepository(MoodEntry)
    private moodEntryRepository: Repository<MoodEntry>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private langChainService: LangChainService,
    private redisService: RedisService,
  ) {}

  async createHabit(userId: string, createHabitDto: CreateHabitDto): Promise<HabitTracking> {
    const habit = this.habitTrackingRepository.create({
      userId,
      habitId: `habit_${Date.now()}`,
      ...createHabitDto,
    });

    return this.habitTrackingRepository.save(habit);
  }

  async getUserHabits(userId: string, category?: HabitCategory): Promise<HabitTracking[]> {
    const query = this.habitTrackingRepository.createQueryBuilder('habit').where('habit.userId = :userId', { userId });

    if (category) {
      query.andWhere('habit.category = :category', { category });
    }

    return query.orderBy('habit.createdAt', 'DESC').getMany();
  }

  async getHabitById(id: string, userId: string): Promise<HabitTracking> {
    const habit = await this.habitTrackingRepository.findOne({
      where: { id, userId },
    });

    if (!habit) {
      throw new Error('Habit not found or access denied');
    }

    return habit;
  }

  async updateHabit(id: string, userId: string, updateHabitDto: UpdateHabitDto): Promise<HabitTracking> {
    await this.habitTrackingRepository.update({ id, userId }, updateHabitDto);
    return this.getHabitById(id, userId);
  }

  async completeHabit(id: string, userId: string, completeHabitDto: CompleteHabitDto): Promise<HabitTracking> {
    const habit = await this.getHabitById(id, userId);

    const updateData: Partial<HabitTracking> = {
      isCompleted: completeHabitDto.isCompleted,
    };

    if (completeHabitDto.isCompleted) {
      updateData.completedAt = new Date();
      updateData.streakCount = habit.streakCount + 1;
    } else {
      updateData.completedAt = null;
      updateData.streakCount = 0;
    }

    await this.habitTrackingRepository.update(id, updateData);
    return this.getHabitById(id, userId);
  }

  async deleteHabit(id: string, userId: string): Promise<void> {
    const result = await this.habitTrackingRepository.delete({ id, userId });
    if (result.affected === 0) {
      throw new Error('Habit not found or access denied');
    }
  }

  async getPersonalizedSuggestions(userId: string): Promise<HabitSuggestion[]> {
    // Check cache first
    const cacheKey = `habit_suggestions:${userId}`;
    const cachedSuggestions = await this.redisService.getCachedData(cacheKey);

    if (cachedSuggestions) {
      return cachedSuggestions;
    }

    // Get user's recent mood data
    const recentMoods = await this.moodEntryRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 10,
    });

    // Get user's existing habits
    const existingHabits = await this.getUserHabits(userId);
    const existingHabitTitles = existingHabits.map((h) => h.title);

    // Get user preferences
    const user = await this.userRepository.findOne({ where: { id: userId } });

    // Calculate average mood level
    const avgMoodLevel =
      recentMoods.length > 0
        ? Math.round(recentMoods.reduce((sum, mood) => sum + mood.level, 0) / recentMoods.length)
        : MoodLevel.NEUTRAL;

    // Build user context
    const userContext = this.buildUserContext(user, recentMoods, existingHabits);

    // Get AI suggestions
    const suggestions = await this.langChainService.suggestHabits(
      avgMoodLevel as MoodLevel,
      userContext,
      existingHabitTitles,
    );

    // Cache suggestions for 1 hour
    await this.redisService.cacheData(cacheKey, suggestions, 3600);

    return suggestions;
  }

  private buildUserContext(user: User, moods: MoodEntry[], habits: HabitTracking[]): string {
    const context = [];

    if (user?.department) {
      context.push(`Works in ${user.department}`);
    }

    if (user?.jobTitle) {
      context.push(`Job title: ${user.jobTitle}`);
    }

    if (moods.length > 0) {
      const avgMood = moods.reduce((sum, mood) => sum + mood.level, 0) / moods.length;
      context.push(`Average mood level: ${avgMood.toFixed(1)}/5`);

      const commonEmotions = this.getCommonEmotions(moods);
      if (commonEmotions.length > 0) {
        context.push(`Common emotions: ${commonEmotions.join(', ')}`);
      }
    }

    if (habits.length > 0) {
      const categories = [...new Set(habits.map((h) => h.category))];
      context.push(`Current habit categories: ${categories.join(', ')}`);

      const completedHabits = habits.filter((h) => h.isCompleted).length;
      context.push(`Completed habits: ${completedHabits}/${habits.length}`);
    }

    return context.join('. ');
  }

  private getCommonEmotions(moods: MoodEntry[]): string[] {
    const emotionCounts = new Map<string, number>();

    moods.forEach((mood) => {
      if (mood.emotions) {
        mood.emotions.forEach((emotion) => {
          emotionCounts.set(emotion, (emotionCounts.get(emotion) || 0) + 1);
        });
      }
    });

    return Array.from(emotionCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([emotion]) => emotion);
  }

  async getHabitStats(userId: string): Promise<{
    totalHabits: number;
    completedHabits: number;
    completionRate: number;
    streakStats: { maxStreak: number; currentStreaks: number };
    categoryBreakdown: Record<HabitCategory, number>;
  }> {
    const habits = await this.getUserHabits(userId);

    const totalHabits = habits.length;
    const completedHabits = habits.filter((h) => h.isCompleted).length;
    const completionRate = totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0;

    const maxStreak = Math.max(...habits.map((h) => h.streakCount), 0);
    const currentStreaks = habits.filter((h) => h.streakCount > 0).length;

    const categoryBreakdown = habits.reduce(
      (acc, habit) => {
        acc[habit.category] = (acc[habit.category] || 0) + 1;
        return acc;
      },
      {} as Record<HabitCategory, number>,
    );

    return {
      totalHabits,
      completedHabits,
      completionRate: Math.round(completionRate * 100) / 100,
      streakStats: { maxStreak, currentStreaks },
      categoryBreakdown,
    };
  }

  async getHabitsByCategory(userId: string, category: HabitCategory): Promise<HabitTracking[]> {
    return this.habitTrackingRepository.find({
      where: { userId, category },
      order: { createdAt: 'DESC' },
    });
  }

  async resetHabitStreak(id: string, userId: string): Promise<HabitTracking> {
    await this.habitTrackingRepository.update(
      { id, userId },
      { streakCount: 0, isCompleted: false, completedAt: null },
    );
    return this.getHabitById(id, userId);
  }

  async getRecommendedHabits(): Promise<HabitSuggestion[]> {
    // Return a curated list of evidence-based habits
    return [
      {
        id: 'meditation',
        title: 'Daily Meditation',
        description: 'Practice mindfulness meditation for 10-15 minutes daily',
        category: HabitCategory.MENTAL_HEALTH,
        difficulty: 'easy',
        estimatedTime: '10-15 minutes',
        benefits: ['Reduced stress', 'Better focus', 'Improved emotional regulation'],
      },
      {
        id: 'deep_breathing',
        title: 'Deep Breathing Exercises',
        description: 'Practice deep breathing techniques during work breaks',
        category: HabitCategory.STRESS_MANAGEMENT,
        difficulty: 'easy',
        estimatedTime: '5 minutes',
        benefits: ['Immediate stress relief', 'Better oxygen flow', 'Improved focus'],
      },
      {
        id: 'gratitude_journal',
        title: 'Gratitude Journaling',
        description: 'Write down 3 things you are grateful for each day',
        category: HabitCategory.MENTAL_HEALTH,
        difficulty: 'easy',
        estimatedTime: '5 minutes',
        benefits: ['Improved mood', 'Better perspective', 'Increased positivity'],
      },
      {
        id: 'walking_breaks',
        title: 'Regular Walking Breaks',
        description: 'Take a 10-minute walk every 2 hours during work',
        category: HabitCategory.PHYSICAL_HEALTH,
        difficulty: 'easy',
        estimatedTime: '10 minutes',
        benefits: ['Better circulation', 'Reduced eye strain', 'Mental clarity'],
      },
      {
        id: 'social_connection',
        title: 'Daily Social Check-in',
        description: 'Have a meaningful conversation with a colleague or friend',
        category: HabitCategory.SOCIAL_CONNECTION,
        difficulty: 'medium',
        estimatedTime: '15 minutes',
        benefits: ['Stronger relationships', 'Reduced isolation', 'Better support network'],
      },
    ];
  }
}
