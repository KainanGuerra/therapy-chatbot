import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';

// Configuration
import databaseConfig from './config/database.config';
import redisConfig from './config/redis.config';
import langchainConfig from './config/langchain.config';

// Modules
import { AuthModule } from './modules/auth/auth.module';
import { RedisModule } from './modules/redis/redis.module';
import { LangChainModule } from './modules/langchain/langchain.module';
import { ChatModule } from './modules/chat/chat.module';
import { ProfessionalsModule } from './modules/professionals/professionals.module';
import { HabitsModule } from './modules/habits/habits.module';

// Entities
import * as entities from './entities';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, redisConfig, langchainConfig],
      envFilePath: ['.env.local', '.env'],
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        ...configService.get('database'),
        entities: Object.values(entities),
      }),
      inject: [ConfigService],
    }),

    // Rate Limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => [
        {
          ttl: configService.get<number>('THROTTLE_TTL', 60) * 1000, // Convert to milliseconds
          limit: configService.get<number>('THROTTLE_LIMIT', 10),
        },
      ],
      inject: [ConfigService],
    }),

    // Application Modules
    RedisModule,
    LangChainModule,
    AuthModule,
    ChatModule,
    ProfessionalsModule,
    HabitsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
