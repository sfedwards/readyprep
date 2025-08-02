import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';

@Entity()
@Unique(['name'])
export class JobSchedule {
  constructor(jobSchedule?: Partial<JobSchedule>) {
    Object.assign(this, jobSchedule);
  }

  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column()
  name: string;

  @Column()
  schedule: string; // cron

  @Column({ nullable: true })
  lastRanAt: Date;

  @Column({ nullable: true })
  nextRunAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @VersionColumn()
  version: number;
}
