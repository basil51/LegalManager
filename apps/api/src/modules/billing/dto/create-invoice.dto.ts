import { IsString, IsOptional, IsNumber, IsDateString, IsUUID, IsArray, ValidateNested, IsEnum, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { InvoiceStatus, PaymentMethod } from '../invoice.entity';
import { ItemType } from '../invoice-item.entity';

export class CreateInvoiceItemDto {
  @IsString()
  description!: string;

  @IsEnum(ItemType)
  type!: ItemType;

  @IsNumber()
  @Min(0)
  quantity!: number;

  @IsNumber()
  @Min(0)
  unit_price!: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateInvoiceDto {
  @IsOptional()
  @IsUUID()
  caseId?: string;

  @IsUUID()
  clientId!: string;

  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus;

  @IsOptional()
  @IsNumber()
  @Min(0)
  tax_amount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discount_amount?: number;

  @IsDateString()
  issue_date!: string;

  @IsDateString()
  due_date!: string;

  @IsOptional()
  @IsEnum(PaymentMethod)
  payment_method?: PaymentMethod;

  @IsOptional()
  @IsString()
  payment_reference?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  terms_and_conditions?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemDto)
  items!: CreateInvoiceItemDto[];
}
