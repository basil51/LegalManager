import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Tenant } from '../tenants/tenant.entity';
import { Case } from '../cases/case.entity';
import { Client } from '../clients/client.entity';
import { User } from '../users/user.entity';
import { InvoiceItem } from './invoice-item.entity';

export enum InvoiceStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
  PARTIALLY_PAID = 'partially_paid'
}

export enum PaymentMethod {
  CASH = 'cash',
  CHECK = 'check',
  BANK_TRANSFER = 'bank_transfer',
  CREDIT_CARD = 'credit_card',
  ONLINE_PAYMENT = 'online_payment',
  OTHER = 'other'
}

@Entity({ name: 'invoices' })
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Tenant, { nullable: false })
  @JoinColumn({ name: 'tenantId' })
  tenant!: Tenant;

  @ManyToOne(() => Case, { nullable: true })
  @JoinColumn({ name: 'caseId' })
  case!: Case | null;

  @ManyToOne(() => Client, { nullable: false })
  @JoinColumn({ name: 'clientId' })
  client!: Client;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'createdById' })
  created_by!: User;

  @Column({ type: 'text' })
  invoice_number!: string;

  @Column({ type: 'text' })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ 
    type: 'enum', 
    enum: InvoiceStatus, 
    default: InvoiceStatus.DRAFT 
  })
  status!: InvoiceStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  subtotal!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  tax_amount!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount_amount!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total_amount!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  paid_amount!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  balance_due!: number;

  @Column({ type: 'date' })
  issue_date!: Date;

  @Column({ type: 'date' })
  due_date!: Date;

  @Column({ type: 'date', nullable: true })
  paid_date!: Date | null;

  @Column({ 
    type: 'enum', 
    enum: PaymentMethod, 
    nullable: true 
  })
  payment_method!: PaymentMethod | null;

  @Column({ type: 'text', nullable: true })
  payment_reference!: string | null;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @Column({ type: 'text', nullable: true })
  terms_and_conditions!: string | null;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;

  @OneToMany(() => InvoiceItem, (item) => item.invoice, { cascade: true })
  items!: InvoiceItem[];
}
