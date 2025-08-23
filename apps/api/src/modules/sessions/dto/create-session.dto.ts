import { IsString, IsOptional, IsBoolean, IsDateString, IsUUID, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { SessionType, SessionStatus } from '../session.entity';

export class CreateSessionDto {
  @IsUUID()
  caseId!: string;

  @IsOptional()
  @IsUUID()
  courtId?: string;

  @IsUUID()
  assignedLawyerId!: string;

  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(SessionType)
  type?: SessionType;

  @IsOptional()
  @IsEnum(SessionStatus)
  status?: SessionStatus;

  @IsDateString()
  @Transform(({ value }: { value: string }) => new Date(value))
  scheduled_at!: Date;

  @IsOptional()
  @IsDateString()
  @Transform(({ value }: { value: string }) => value ? new Date(value) : null)
  completed_at?: Date | null;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  outcome?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
