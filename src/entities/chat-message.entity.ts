import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ChatSession } from './chat-session.entity';
import { MessageType } from '../common/enums';

@Entity('chat_messages')
export class ChatMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  sessionId: string;

  @Column('text')
  content: string;

  @Column({
    type: 'enum',
    enum: MessageType,
    default: MessageType.USER,
  })
  type: MessageType;

  @Column({ type: 'json', nullable: true })
  moodAnalysis: {
    level: number;
    confidence: number;
    keywords: string[];
    sentiment: string;
    emotions: string[];
  };

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => ChatSession, (session) => session.messages)
  @JoinColumn({ name: 'sessionId' })
  session: ChatSession;
}
