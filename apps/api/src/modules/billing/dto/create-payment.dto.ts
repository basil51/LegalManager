import { IsString, IsOptional, IsNumber, IsDateString, IsUUID, IsEnum, Min } from 'class-validator';
import { PaymentStatus } from '../payment.entity';

export class CreatePaymentDto {
  @IsUUID()
  invoiceId!: string;

  @IsNumber()
  @Min(0)
  amount!: number;

  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @IsString()
  payment_method!: string;

  @IsOptional()
  @IsString()
  reference_number?: string;

  @IsOptional()
  @IsString()
  transaction_id?: string;

  @IsDateString()
  payment_date!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
