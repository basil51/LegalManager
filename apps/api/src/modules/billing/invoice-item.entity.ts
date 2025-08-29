import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Tenant } from '../tenants/tenant.entity';
import { Invoice } from './invoice.entity';

export enum ItemType {
  SERVICE = 'service',
  EXPENSE = 'expense',
  DISBURSEMENT = 'disbursement',
  FEE = 'fee',
  OTHER = 'other'
}

@Entity({ name: 'invoice_items' })
export class InvoiceItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Tenant, { nullable: false })
  @JoinColumn({ name: 'tenantId' })
  tenant!: Tenant;

  @ManyToOne(() => Invoice, { nullable: false })
  @JoinColumn({ name: 'invoiceId' })
  invoice!: Invoice;

  @Column({ type: 'text' })
  description!: string;

  @Column({ 
    type: 'enum', 
    enum: ItemType, 
    default: ItemType.SERVICE 
  })
  type!: ItemType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unit_price!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total_amount!: number;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;
}
