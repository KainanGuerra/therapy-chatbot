import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Professional, MoodEntry, User } from '../../entities';
import { LangChainService } from '../langchain/langchain.service';
import { RedisService } from '../redis/redis.service';
import { CreateProfessionalDto, UpdateProfessionalDto } from './dto/professional.dto';
import { ProfessionalType, MoodLevel } from '../../common/enums';
import { ProfessionalRecommendation } from '../../common/interfaces';

@Injectable()
export class ProfessionalsService {
  constructor(
    @InjectRepository(Professional)
    private professionalRepository: Repository<Professional>,
    @InjectRepository(MoodEntry)
    private moodEntryRepository: Repository<MoodEntry>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private langChainService: LangChainService,
    private redisService: RedisService,
  ) {}

  async create(createProfessionalDto: CreateProfessionalDto): Promise<Professional> {
    const professional = this.professionalRepository.create(createProfessionalDto);
    return this.professionalRepository.save(professional);
  }

  async findAll(type?: ProfessionalType, specialization?: string): Promise<Professional[]> {
    const query = this.professionalRepository
      .createQueryBuilder('professional')
      .where('professional.isAvailable = :isAvailable', { isAvailable: true });

    if (type) {
      query.andWhere('professional.type = :type', { type });
    }

    if (specialization) {
      query.andWhere('professional.specializations @> :specialization', {
        specialization: JSON.stringify([specialization]),
      });
    }

    return query.orderBy('professional.rating', 'DESC').addOrderBy('professional.reviewCount', 'DESC').getMany();
  }

  async findOne(id: string): Promise<Professional> {
    const professional = await this.professionalRepository.findOne({ where: { id } });
    if (!professional) {
      throw new Error('Professional not found');
    }
    return professional;
  }

  async update(id: string, updateProfessionalDto: UpdateProfessionalDto): Promise<Professional> {
    await this.professionalRepository.update(id, updateProfessionalDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.professionalRepository.update(id, { isAvailable: false });
  }

  async getRecommendations(userId: string): Promise<{
    recommendation: ProfessionalRecommendation;
    professionals: Professional[];
  }> {
    // Get user's recent mood history
    const recentMoods = await this.moodEntryRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 10,
    });

    // Get user preferences
    const user = await this.userRepository.findOne({ where: { id: userId } });

    // Calculate average mood level
    const avgMoodLevel =
      recentMoods.length > 0
        ? Math.round(recentMoods.reduce((sum, mood) => sum + mood.level, 0) / recentMoods.length)
        : MoodLevel.NEUTRAL;

    // Get recent message history (simplified - in real app, get from chat context)
    const messageHistory = recentMoods.map(
      (mood) => `Mood: ${mood.level}, Keywords: ${mood.keywords?.join(', ')}, Sentiment: ${mood.sentiment}`,
    );

    // Get AI recommendation
    const recommendation = await this.langChainService.recommendProfessional(
      avgMoodLevel as MoodLevel,
      messageHistory,
      user?.preferences || {},
    );

    // Find matching professionals
    const professionals = await this.findProfessionalsByRecommendation(recommendation);

    // Cache recommendation
    await this.redisService.cacheData(
      `recommendations:${userId}`,
      { recommendation, professionals },
      1800, // 30 minutes
    );

    return { recommendation, professionals };
  }

  private async findProfessionalsByRecommendation(recommendation: ProfessionalRecommendation): Promise<Professional[]> {
    const query = this.professionalRepository
      .createQueryBuilder('professional')
      .where('professional.isAvailable = :isAvailable', { isAvailable: true })
      .andWhere('professional.type = :type', { type: recommendation.type });

    // Filter by specializations if available
    if (recommendation.specializations.length > 0) {
      const specializationConditions = recommendation.specializations
        .map((spec, index) => `professional.specializations @> :spec${index}`)
        .join(' OR ');

      query.andWhere(`(${specializationConditions})`);

      recommendation.specializations.forEach((spec, index) => {
        query.setParameter(`spec${index}`, JSON.stringify([spec]));
      });
    }

    return query
      .orderBy('professional.rating', 'DESC')
      .addOrderBy('professional.reviewCount', 'DESC')
      .limit(5)
      .getMany();
  }

  async rateProfessional(professionalId: string, rating: number, _userId: string): Promise<Professional> {
    const professional = await this.findOne(professionalId);

    // Calculate new rating (simplified - in production, store individual ratings)
    const totalRating = (professional.rating || 0) * professional.reviewCount + rating;
    const newReviewCount = professional.reviewCount + 1;
    const newRating = totalRating / newReviewCount;

    await this.professionalRepository.update(professionalId, {
      rating: Math.round(newRating * 100) / 100, // Round to 2 decimal places
      reviewCount: newReviewCount,
    });

    return this.findOne(professionalId);
  }

  async searchProfessionals(query: string): Promise<Professional[]> {
    return this.professionalRepository
      .createQueryBuilder('professional')
      .where('professional.isAvailable = :isAvailable', { isAvailable: true })
      .andWhere(
        '(professional.name ILIKE :query OR professional.specializations::text ILIKE :query OR professional.bio ILIKE :query)',
        { query: `%${query}%` },
      )
      .orderBy('professional.rating', 'DESC')
      .limit(10)
      .getMany();
  }

  async getProfessionalsByType(type: ProfessionalType): Promise<Professional[]> {
    return this.professionalRepository.find({
      where: { type, isAvailable: true },
      order: { rating: 'DESC', reviewCount: 'DESC' },
    });
  }

  async getTopRatedProfessionals(limit: number = 10): Promise<Professional[]> {
    return this.professionalRepository.find({
      where: { isAvailable: true },
      order: { rating: 'DESC', reviewCount: 'DESC' },
      take: limit,
    });
  }
}
