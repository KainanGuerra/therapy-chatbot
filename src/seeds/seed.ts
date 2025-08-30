import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Professional } from '../entities/professional.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { professionalSeeds } from './professionals.seed';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  try {
    const professionalRepository = app.get<Repository<Professional>>(
      getRepositoryToken(Professional),
    );

    console.log('🌱 Starting database seeding...');

    // Clear existing professionals
    await professionalRepository.clear();
    console.log('🗑️  Cleared existing professionals');

    // Seed professionals
    for (const professionalData of professionalSeeds) {
      const professional = professionalRepository.create(professionalData);
      await professionalRepository.save(professional);
    }
    
    console.log(`✅ Seeded ${professionalSeeds.length} professionals`);
    console.log('🎉 Database seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

seed();