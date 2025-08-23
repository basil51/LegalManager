import { IsString, IsOptional, IsBoolean, IsDateString, IsUUID, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { CaseStatus, CaseType } from '../case.entity';

export class CreateCaseDto {
  @IsUUID()
  clientId!: string;

  @IsOptional()
  @IsUUID()
  courtId?: string;

  @IsUUID()
  assignedLawyerId!: string;

  @IsString()
  case_number!: string;

  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(CaseStatus)
  status?: CaseStatus;

  @IsOptional()
  @IsEnum(CaseType)
  type?: CaseType;

  @IsOptional()
  @IsString()
  filing_date?: string | null;

  @IsOptional()
  @IsString()
  hearing_date?: string | null;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
