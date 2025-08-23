import { IsOptional, IsEnum, IsUUID, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { DocumentType } from '../document.entity';

export class FindDocumentsDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(DocumentType)
  type?: DocumentType;

  @IsOptional()
  @IsUUID()
  caseId?: string;

  @IsOptional()
  @IsUUID()
  clientId?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map(tag => tag.trim()).filter(Boolean);
    }
    return value;
  })
  tags?: string[];
}
