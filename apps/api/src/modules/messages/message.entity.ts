import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Tenant } from '../tenants/tenant.entity';
import { User } from '../users/user.entity';

export enum MessageType {
  INTERNAL = 'internal',
  CLIENT_COMMUNICATION = 'client_communication',
  CASE_UPDATE = 'case_update',
  APPOINTMENT_REMINDER = 'appointment_reminder',
  SYSTEM_NOTIFICATION = 'system_notification'
}

export enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed'
}

@Entity({ name: 'messages' })
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Tenant, { nullable: false })
  tenant!: Tenant;

  @ManyToOne(() => User, { nullable: false })
  sender!: User;

  @ManyToOne(() => User, { nullable: false })
  recipient!: User;

  @Column({ type: 'text' })
  subject!: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({ 
    type: 'enum', 
    enum: MessageType, 
    default: MessageType.INTERNAL 
  })
  type!: MessageType;

  @Column({ 
    type: 'enum', 
    enum: MessageStatus, 
    default: MessageStatus.SENT 
  })
  status!: MessageStatus;

  @Column({ type: 'uuid', nullable: true })
  threadId!: string | null; // For message threading/replies

  @Column({ type: 'uuid', nullable: true })
  parentMessageId!: string | null; // Direct parent message for replies

  @Column({ type: 'uuid', nullable: true })
  caseId!: string | null; // Associated case

  @Column({ type: 'uuid', nullable: true })
  appointmentId!: string | null; // Associated appointment

  @Column({ type: 'uuid', nullable: true })
  clientId!: string | null; // Associated client

  @Column({ type: 'boolean', default: false })
  is_urgent!: boolean;

  @Column({ type: 'boolean', default: false })
  is_archived!: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  read_at!: Date | null;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;
}
