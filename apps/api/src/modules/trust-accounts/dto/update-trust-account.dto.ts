import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateTrustAccountDto {
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
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
