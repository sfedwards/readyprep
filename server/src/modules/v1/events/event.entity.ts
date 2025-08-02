import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
  VersionColumn,
} from 'typeorm';

export enum EventType {
  CLOVER_WEBHOOK = 'CLOVER_WEBHOOK',
  DAILY_PREP_EMAIL = 'DAILY_PREP_EMAIL',
  JOB = 'JOB',
  STRIPE_WEBHOOK = 'STRIPE_WEBHOOK',
  SQUARE_WEBHOOK = 'SQUARE_WEBHOOK',
  SQUARE_REFRESH_TOKEN_REQUEST = 'SQUARE_REFRESH_TOKEN_REQUEST',
}

@Entity()
@Index(['time'], { where: '"processedAt" IS NULL' })
@Unique(['type', 'dedupeId'])
export class Event {
  constructor(menu?: Partial<Event>) {
    Object.assign(this, menu);
  }

  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column()
  type: EventType;

  @Column({ nullable: true })
  dedupeId: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  time: Date;

  @Column('json')
  data: Record<string, any | string>;

  @Column({ nullable: true })
  processedAt: Date;

  @Column({ nullable: true })
  error: string;

  @CreateDateColumn()
  createdAt: Date;

  @VersionColumn()
  version: number;
}
