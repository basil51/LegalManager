import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Tenant } from '../tenants/tenant.entity';
import { User } from '../users/user.entity';
import { Client } from '../clients/client.entity';
import { Case } from '../cases/case.entity';

export enum AppointmentType {
  CONSULTATION = 'consultation',
  COURT_HEARING = 'court_hearing',
  CLIENT_MEETING = 'client_meeting',
  DOCUMENT_REVIEW = 'document_review',
  PHONE_CALL = 'phone_call',
  VIDEO_CALL = 'video_call',
  OTHER = 'other'
}

export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  NO_SHOW = 'no_show'
}

export enum ReminderType {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  CALENDAR = 'calendar'
}

@Entity({ name: 'appointments' })
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Tenant, { nullable: false })
  tenant!: Tenant;

  @ManyToOne(() => User, { nullable: false })
  lawyer!: User;

  @ManyToOne(() => Client, { nullable: true })
  client!: Client | null;

  @ManyToOne(() => Case, { nullable: true })
  case!: Case | null;

  @Column({ type: 'text' })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ 
    type: 'enum', 
    enum: AppointmentType, 
    default: AppointmentType.OTHER 
  })
  type!: AppointmentType;

  @Column({ 
    type: 'enum', 
    enum: AppointmentStatus, 
    default: AppointmentStatus.SCHEDULED 
  })
  status!: AppointmentStatus;

  @Column({ type: 'timestamptz' })
  scheduled_at!: Date;

  @Column({ type: 'integer', default: 60 })
  duration_minutes!: number; // Duration in minutes

  @Column({ type: 'text', nullable: true })
  location!: string | null;

  @Column({ type: 'text', nullable: true })
  meeting_link!: string | null; // For video calls

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @Column({ type: 'boolean', default: false })
  is_recurring!: boolean;

  @Column({ type: 'text', nullable: true })
  recurrence_pattern!: string | null; // JSON string for recurrence rules

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;
}
