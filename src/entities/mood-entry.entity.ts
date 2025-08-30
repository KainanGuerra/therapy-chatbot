import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { MoodLevel } from '../common/enums';

@Entity('mood_entries')
export class MoodEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({
    type: 'enum',
    enum: MoodLevel,
  })
  level: MoodLevel;

  @Column({ type: 'decimal', precision: 3, scale: 2 })
  confidence: number;

  @Column({ type: 'json', nullable: true })
  keywords: string[];

  @Column()
  sentiment: string;

  @Column({ type: 'json', nullable: true })
  emotions: string[];

  @Column({ nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.moodEntries)
  @JoinColumn({ name: 'userId' })
  user: User;
}