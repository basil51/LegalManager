import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Tenant } from '../tenants/tenant.entity';
import { Invoice } from './invoice.entity';
import { Client } from '../clients/client.entity';
import { User } from '../users/user.entity';

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

@Entity({ name: 'payments' })
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Tenant, { nullable: false })
  @JoinColumn({ name: 'tenantId' })
  tenant!: Tenant;

  @ManyToOne(() => Invoice, { nullable: false })
  @JoinColumn({ name: 'invoiceId' })
  invoice!: Invoice;

  @ManyToOne(() => Client, { nullable: false })
  @JoinColumn({ name: 'clientId' })
  client!: Client;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'processedById' })
  processed_by!: User | null;

  @Column({ type: 'text' })
  payment_number!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount!: number;

  @Column({ 
    type: 'enum', 
    enum: PaymentStatus, 
    default: PaymentStatus.PENDING 
  })
  status!: PaymentStatus;

  @Column({ type: 'text' })
  payment_method!: string;

  @Column({ type: 'text', nullable: true })
  reference_number!: string | null;

  @Column({ type: 'text', nullable: true })
  transaction_id!: string | null;

  @Column({ type: 'date' })
  payment_date!: Date;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;
}
