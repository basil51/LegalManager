import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Document } from './document.entity';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { MinioService } from './minio.service';
import { TenantsModule } from '../tenants/tenants.module';

@Module({
  imports: [TypeOrmModule.forFeature([Document]), TenantsModule],
  controllers: [DocumentsController],
  providers: [DocumentsService, MinioService],
  exports: [DocumentsService, MinioService],
})
export class DocumentsModule {}
