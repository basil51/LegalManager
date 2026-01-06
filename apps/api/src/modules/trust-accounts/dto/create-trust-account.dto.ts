import { IsString, IsOptional, IsUUID, IsNumber, Min } from 'class-validator';

export class CreateTrustAccountDto {
  @IsUUID()
  clientId!: string;

  @IsOptional()
  @IsUUID()
  caseId?: string;

  @IsString()
  account_number!: string;

  @IsOptional()
  @IsString()
  bank_name?: string;

  @IsOptional()
  @IsString()
  bank_account_number?: string;

  @IsOptional()
  @IsString()
  routing_number?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  initial_balance?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
