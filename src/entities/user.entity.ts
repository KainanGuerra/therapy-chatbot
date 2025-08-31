import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ChatSession } from './chat-session.entity';
import { MoodEntry } from './mood-entry.entity';
import { HabitTracking } from './habit-tracking.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  department: string;

  @Column({ nullable: true })
  jobTitle: string;

  @Column({ type: 'json', nullable: true })
  preferences: {
    preferredProfessionalType?: string;
    habitCategories: string[];
    communicationStyle: string;
    privacyLevel: string;
  };

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => ChatSession, (session) => session.user)
  chatSessions: ChatSession[];

  @OneToMany(() => MoodEntry, (mood) => mood.user)
  moodEntries: MoodEntry[];

  @OneToMany(() => HabitTracking, (habit) => habit.user)
  habitTrackings: HabitTracking[];
}
