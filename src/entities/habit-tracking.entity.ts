import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { HabitCategory } from '../common/enums';

@Entity('habit_trackings')
export class HabitTracking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  habitId: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: HabitCategory,
  })
  category: HabitCategory;

  @Column()
  difficulty: string;

  @Column()
  estimatedTime: string;

  @Column({ type: 'json' })
  benefits: string[];

  @Column({ default: false })
  isCompleted: boolean;

  @Column({ type: 'date', nullable: true })
  completedAt: Date;

  @Column({ default: 0 })
  streakCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.habitTrackings)
  @JoinColumn({ name: 'userId' })
  user: User;
}