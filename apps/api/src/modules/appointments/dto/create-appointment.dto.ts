import { IsString, IsOptional, IsBoolean, IsDateString, IsUUID, IsEnum, IsNumber, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';
import { AppointmentType, AppointmentStatus } from '../appointment.entity';

export class CreateAppointmentDto {
  @IsUUID()
  lawyerId!: string;

  @IsOptional()
  @IsUUID()
  clientId?: string;

  @IsOptional()
  @IsUUID()
  caseId?: string;

  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(AppointmentType)
  type?: AppointmentType;

  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @IsString()
  scheduled_at!: string;

  @IsOptional()
  @IsNumber()
  duration_minutes?: number;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  meeting_link?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  is_recurring?: boolean;

  @IsOptional()
  @IsString()
  recurrence_pattern?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
