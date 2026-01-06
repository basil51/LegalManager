import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { Tenant } from '../tenants/tenant.entity';
import { TrustAccount } from './trust-account.entity';
import { User } from '../users/user.entity';
import { Case } from '../cases/case.entity';

export enum TrustTransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  TRANSFER = 'transfer',
  FEE = 'fee',
  INTEREST = 'interest',
  ADJUSTMENT = 'adjustment'
}

@Entity({ name: 'trust_transactions' })
export class TrustTransaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Tenant, { nullable: false })
  @JoinColumn({ name: 'tenantId' })
  tenant!: Tenant;

  @ManyToOne(() => TrustAccount, { nullable: false })
  @JoinColumn({ name: 'trust_account_id' })
  trust_account!: TrustAccount;

  @ManyToOne(() => Case, { nullable: true })
  @JoinColumn({ name: 'caseId' })
  case!: Case | null;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'created_by_id' })
  created_by!: User;

  @Column({
    type: 'enum',
    enum: TrustTransactionType,
    default: TrustTransactionType.DEPOSIT
  })
  transaction_type!: TrustTransactionType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount!: number;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'text', nullable: true })
  reference_number!: string | null;

  @Column({ type: 'text', nullable: true })
  check_number!: string | null;

  @Column({ type: 'date' })
  transaction_date!: Date;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;
}
