import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  VersionColumn,
} from 'typeorm';

@Entity()
@Index(['time'], { where: '"processedAt" IS NULL' })
export class Job {
  constructor(job?: Partial<Job>) {
    Object.assign(this, job);
  }

  @PrimaryGeneratedColumn('uuid')
  id: number;

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
