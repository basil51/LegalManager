import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Tenant } from '../tenants/tenant.entity';
import { Client } from '../clients/client.entity';
import { Court } from '../courts/court.entity';
import { User } from '../users/user.entity';

export enum CaseStatus {
  OPEN = 'open',
  CLOSED = 'closed',
  PENDING = 'pending',
  ON_HOLD = 'on_hold'
}

export enum CaseType {
  CIVIL = 'civil',
  CRIMINAL = 'criminal',
  FAMILY = 'family',
  CORPORATE = 'corporate',
  REAL_ESTATE = 'real_estate',
  OTHER = 'other'
}

@Entity({ name: 'cases' })
export class Case {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Tenant, { nullable: false })
  tenant!: Tenant;

  @ManyToOne(() => Client, { nullable: false })
  client!: Client;

  @ManyToOne(() => Court, { nullable: true })
  court!: Court | null;

  @ManyToOne(() => User, { nullable: false })
  assigned_lawyer!: User;

  @Column({ type: 'text' })
  case_number!: string;

  @Column({ type: 'text' })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ 
    type: 'enum', 
    enum: CaseStatus, 
    default: CaseStatus.OPEN 
  })
  status!: CaseStatus;

  @Column({ 
    type: 'enum', 
    enum: CaseType, 
    default: CaseType.OTHER 
  })
  type!: CaseType;

  @Column({ type: 'date', nullable: true })
  filing_date!: Date | null;

  @Column({ type: 'date', nullable: true })
  hearing_date!: Date | null;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;
}
