import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn, JoinColumn, Index } from 'typeorm';
import { Tenant } from '../tenants/tenant.entity';
import { Client } from '../clients/client.entity';
import { Case } from '../cases/case.entity';
import { TrustTransaction } from './trust-transaction.entity';

@Entity({ name: 'trust_accounts' })
@Index(['account_number', 'tenant'], { unique: true })
export class TrustAccount {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Tenant, { nullable: false })
  @JoinColumn({ name: 'tenantId' })
  tenant!: Tenant;

  @ManyToOne(() => Client, { nullable: false })
  @JoinColumn({ name: 'clientId' })
  client!: Client;

  @ManyToOne(() => Case, { nullable: true })
  @JoinColumn({ name: 'caseId' })
  case!: Case | null;

  @Column({ type: 'text' })
  account_number!: string;

  @Column({ type: 'text', nullable: true })
  bank_name!: string | null;

  @Column({ type: 'text', nullable: true })
  bank_account_number!: string | null;

  @Column({ type: 'text', nullable: true })
  routing_number!: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  balance!: number;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;

  @OneToMany(() => TrustTransaction, (transaction) => transaction.trust_account, { cascade: true })
  transactions!: TrustTransaction[];
}
