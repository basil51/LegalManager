import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document, DocumentType } from './document.entity';
import { MinioService } from './minio.service';
import { TenantContextService } from '../tenants/tenant-context.service';
import { FindDocumentsDto } from './dto/find-documents.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  constructor(
    @InjectRepository(Document)
    private documentsRepository: Repository<Document>,
    private minioService: MinioService,
    private tenantContextService: TenantContextService,
  ) {}

  async uploadDocument(
    file: Express.Multer.File, 
    title: string,
    description: string | null,
    type: DocumentType,
    caseId: string | null,
    clientId: string | null,
    uploadedById: string,
    tenantId: string,
    tags?: string[]
  ): Promise<Document> {
    try {
      this.logger.log(`Starting document upload for tenant: ${tenantId}, user: ${uploadedById}`);
      
      // Generate unique filename
      const fileExtension = file.originalname.split('.').pop();
      const uniqueFilename = `${uuidv4()}.${fileExtension}`;
      const storagePath = `documents/${tenantId}/${uniqueFilename}`;

      this.logger.log(`Generated filename: ${uniqueFilename}, storage path: ${storagePath}`);

      // Upload to MinIO
      this.logger.log('Attempting to upload to MinIO...');
      await this.minioService.uploadFile(
        storagePath,
        file.buffer,
        file.mimetype,
        {
          originalName: file.originalname,
          uploadedBy: uploadedById,
          tenantId: tenantId,
        }
      );
      this.logger.log('MinIO upload successful');

      // Save document record
      this.logger.log('Creating document record...');
      const document = this.documentsRepository.create({
        tenant: { id: tenantId },
        case: caseId ? { id: caseId } : null,
        client: clientId ? { id: clientId } : null,
        uploaded_by: { id: uploadedById },
        filename: uniqueFilename,
        original_filename: file.originalname,
        mime_type: file.mimetype,
        file_size: file.size,
        storage_path: storagePath,
        title,
        description,
        type,
        tags: tags ? JSON.stringify(tags) : null,
      });

      this.logger.log('Document entity created:', {
        tenantId: document.tenant?.id,
        uploadedById: document.uploaded_by?.id,
        filename: document.filename
      });

      this.logger.log('Saving document to database...');
      const savedDocument = await this.documentsRepository.save(document);
      this.logger.log('Document saved successfully');
      
      return savedDocument;
    } catch (error) {
      this.logger.error(`Upload document error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      this.logger.error(`Error stack: ${error instanceof Error ? error.stack : 'No stack trace'}`);
      throw error;
    }
  }

  async findAll(tenantId: string, filters?: FindDocumentsDto): Promise<Document[]> {
    return this.tenantContextService.withTenantContext(tenantId, async () => {
      const queryBuilder = this.documentsRepository
        .createQueryBuilder('document')
        .leftJoinAndSelect('document.tenant', 'tenant')
        .leftJoinAndSelect('document.case', 'case')
        .leftJoinAndSelect('document.client', 'client')
        .leftJoinAndSelect('document.uploaded_by', 'uploaded_by')
        .where('document.is_active = :isActive', { isActive: true });

      if (filters?.search) {
        queryBuilder.andWhere(
          '(document.title ILIKE :search OR document.description ILIKE :search OR document.original_filename ILIKE :search)',
          { search: `%${filters.search}%` }
        );
      }

      if (filters?.type) {
        queryBuilder.andWhere('document.type = :type', { type: filters.type });
      }

      if (filters?.caseId) {
        queryBuilder.andWhere('case.id = :caseId', { caseId: filters.caseId });
      }

      if (filters?.clientId) {
        queryBuilder.andWhere('client.id = :clientId', { clientId: filters.clientId });
      }

      if (filters?.tags && filters.tags.length > 0) {
        const tagConditions = filters.tags.map((tag, index) => 
          `document.tags::jsonb ? :tag${index}`
        ).join(' AND ');
        queryBuilder.andWhere(`(${tagConditions})`, 
          filters.tags.reduce((acc, tag, index) => ({ ...acc, [`tag${index}`]: tag }), {})
        );
      }

      return queryBuilder
        .orderBy('document.created_at', 'DESC')
        .getMany();
    });
  }

  async findOne(id: string, tenantId: string): Promise<Document | null> {
    return this.tenantContextService.withTenantContext(tenantId, async () => {
      return this.documentsRepository.findOne({
        where: { id, is_active: true },
        relations: ['tenant', 'case', 'client', 'uploaded_by'],
      });
    });
  }

  async findByCase(caseId: string, tenantId: string): Promise<Document[]> {
    return this.tenantContextService.withTenantContext(tenantId, async () => {
      return this.documentsRepository.find({
        where: { case: { id: caseId }, is_active: true },
        relations: ['tenant', 'case', 'client', 'uploaded_by'],
        order: { created_at: 'DESC' },
      });
    });
  }

  async findByClient(clientId: string, tenantId: string): Promise<Document[]> {
    return this.tenantContextService.withTenantContext(tenantId, async () => {
      return this.documentsRepository.find({
        where: { client: { id: clientId }, is_active: true },
        relations: ['tenant', 'case', 'client', 'uploaded_by'],
        order: { created_at: 'DESC' },
      });
    });
  }

  async findByType(type: DocumentType, tenantId: string): Promise<Document[]> {
    return this.tenantContextService.withTenantContext(tenantId, async () => {
      return this.documentsRepository.find({
        where: { type, is_active: true },
        relations: ['tenant', 'case', 'client', 'uploaded_by'],
        order: { created_at: 'DESC' },
      });
    });
  }

  async downloadDocument(id: string, tenantId: string): Promise<{ buffer: Buffer; filename: string; mimeType: string }> {
    return this.tenantContextService.withTenantContext(tenantId, async () => {
      const document = await this.findOne(id, tenantId);
      if (!document) {
        throw new NotFoundException('Document not found');
      }

      const buffer = await this.minioService.downloadFile(document.storage_path);
      return {
        buffer,
        filename: document.original_filename,
        mimeType: document.mime_type,
      };
    });
  }

  async getDownloadUrl(id: string, tenantId: string): Promise<string> {
    return this.tenantContextService.withTenantContext(tenantId, async () => {
      const document = await this.findOne(id, tenantId);
      if (!document) {
        throw new NotFoundException('Document not found');
      }

      return this.minioService.getFileUrl(document.storage_path);
    });
  }

  async updateDocument(
    id: string,
    updateData: Partial<Document> & { tags?: string[] },
    tenantId: string
  ): Promise<Document | null> {
    return this.tenantContextService.withTenantContext(tenantId, async () => {
      const dataToUpdate: Partial<Document> = { ...updateData };
      if (updateData.tags) {
        dataToUpdate.tags = JSON.stringify(updateData.tags);
      }
      await this.documentsRepository.update(id, dataToUpdate);
      return this.findOne(id, tenantId);
    });
  }

  async removeDocument(id: string, tenantId: string): Promise<void> {
    return this.tenantContextService.withTenantContext(tenantId, async () => {
      const document = await this.findOne(id, tenantId);
      if (!document) {
        throw new NotFoundException('Document not found');
      }

      // Soft delete the document record
      await this.documentsRepository.update(id, { is_active: false });

      // Optionally delete from MinIO (uncomment if you want to delete the file)
      // await this.minioService.deleteFile(document.storage_path);
    });
  }
}
