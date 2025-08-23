import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Tenant } from '../tenants/tenant.entity';
import { Case } from '../cases/case.entity';
import { Client } from '../clients/client.entity';
import { User } from '../users/user.entity';

export enum DocumentType {
  CONTRACT = 'contract',
  EVIDENCE = 'evidence',
  COURT_FILING = 'court_filing',
  CORRESPONDENCE = 'correspondence',
  INVOICE = 'invoice',
  RECEIPT = 'receipt',
  OTHER = 'other'
}

@Entity({ name: 'documents' })
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Tenant, { nullable: false })
  @JoinColumn({ name: 'tenantId' })
  tenant!: Tenant;

  @ManyToOne(() => Case, { nullable: true })
  @JoinColumn({ name: 'caseId' })
  case!: Case | null;

  @ManyToOne(() => Client, { nullable: true })
  @JoinColumn({ name: 'clientId' })
  client!: Client | null;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'uploadedById' })
  uploaded_by!: User;

  @Column({ type: 'text' })
  filename!: string;

  @Column({ type: 'text' })
  original_filename!: string;

  @Column({ type: 'text' })
  mime_type!: string;

  @Column({ type: 'bigint' })
  file_size!: number;

  @Column({ type: 'text' })
  storage_path!: string; // MinIO object key

  @Column({ type: 'text' })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ 
    type: 'enum', 
    enum: DocumentType, 
    default: DocumentType.OTHER 
  })
  type!: DocumentType;

  @Column({ type: 'text', nullable: true })
  tags!: string | null; // JSON array of tags

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;
}
