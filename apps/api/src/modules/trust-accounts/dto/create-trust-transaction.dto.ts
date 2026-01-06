import { IsString, IsOptional, IsUUID, IsNumber, IsEnum, IsDateString, Min } from 'class-validator';
import { TrustTransactionType } from '../trust-transaction.entity';

export class CreateTrustTransactionDto {
  @IsUUID()
  trust_account_id!: string;

  @IsOptional()
  @IsUUID()
  caseId?: string;

  @IsEnum(TrustTransactionType)
  transaction_type!: TrustTransactionType;

  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  reference_number?: string;

  @IsOptional()
  @IsString()
  check_number?: string;

  @IsDateString()
  transaction_date!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
