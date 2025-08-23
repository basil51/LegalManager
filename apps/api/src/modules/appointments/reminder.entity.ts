import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Tenant } from '../tenants/tenant.entity';
import { Appointment } from './appointment.entity';
import { User } from '../users/user.entity';
import { ReminderType } from './appointment.entity';

export enum ReminderStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

@Entity({ name: 'reminders' })
export class Reminder {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Tenant, { nullable: false })
  tenant!: Tenant;

  @ManyToOne(() => Appointment, { nullable: false })
  appointment!: Appointment;

  @ManyToOne(() => User, { nullable: false })
  recipient!: User;

  @Column({ 
    type: 'enum', 
    enum: ReminderType, 
    default: ReminderType.EMAIL 
  })
  type!: ReminderType;

  @Column({ type: 'timestamptz' })
  scheduled_at!: Date; // When the reminder should be sent

  @Column({ 
    type: 'enum', 
    enum: ReminderStatus, 
    default: ReminderStatus.PENDING 
  })
  status!: ReminderStatus;

  @Column({ type: 'text', nullable: true })
  message!: string | null;

  @Column({ type: 'text', nullable: true })
  sent_to!: string | null; // Email, phone, etc.

  @Column({ type: 'timestamptz', nullable: true })
  sent_at!: Date | null;

  @Column({ type: 'text', nullable: true })
  error_message!: string | null;

  @Column({ type: 'integer', default: 15 })
  minutes_before!: number; // Minutes before appointment

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;
}
