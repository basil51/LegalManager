import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Tenant } from '../tenants/tenant.entity';
import { Case } from '../cases/case.entity';
import { Court } from '../courts/court.entity';
import { User } from '../users/user.entity';

export enum SessionType {
  HEARING = 'hearing',
  DEPOSITION = 'deposition',
  MEDIATION = 'mediation',
  SETTLEMENT = 'settlement',
  TRIAL = 'trial',
  OTHER = 'other'
}

export enum SessionStatus {
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  POSTPONED = 'postponed'
}

@Entity({ name: 'sessions' })
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Tenant, { nullable: false })
  tenant!: Tenant;

  @ManyToOne(() => Case, { nullable: false })
  case!: Case;

  @ManyToOne(() => Court, { nullable: true })
  court!: Court | null;

  @ManyToOne(() => User, { nullable: false })
  assigned_lawyer!: User;

  @Column({ type: 'text' })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ 
    type: 'enum', 
    enum: SessionType, 
    default: SessionType.OTHER 
  })
  type!: SessionType;

  @Column({ 
    type: 'enum', 
    enum: SessionStatus, 
    default: SessionStatus.SCHEDULED 
  })
  status!: SessionStatus;

  @Column({ type: 'timestamptz' })
  scheduled_at!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  completed_at!: Date | null;

  @Column({ type: 'text', nullable: true })
  location!: string | null;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @Column({ type: 'text', nullable: true })
  outcome!: string | null;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;
}
