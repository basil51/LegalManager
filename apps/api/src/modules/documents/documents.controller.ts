import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param, 
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Res,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { DocumentsService } from './documents.service';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { FindDocumentsDto } from './dto/find-documents.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../tenants/tenant-context.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { DocumentType } from './document.entity';
import { validateFileUpload } from './file-upload.validator';

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDocumentDto: UploadDocumentDto,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: any
  ) {
    // Validate file upload (type, size, security)
    validateFileUpload(file);
    
    return await this.documentsService.uploadDocument(
      file,
      uploadDocumentDto.title,
      uploadDocumentDto.description || null,
      uploadDocumentDto.type,
      uploadDocumentDto.caseId || null,
      uploadDocumentDto.clientId || null,
      user.sub,
      tenantId,
      uploadDocumentDto.tags
    );
  }

  @Get()
  findAll(@Query() filters: FindDocumentsDto, @CurrentTenant() tenantId: string) {
    return this.documentsService.findAll(tenantId, filters);
  }

  @Get('case/:caseId')
  findByCase(@Param('caseId') caseId: string, @CurrentTenant() tenantId: string) {
    return this.documentsService.findByCase(caseId, tenantId);
  }

  @Get('client/:clientId')
  findByClient(@Param('clientId') clientId: string, @CurrentTenant() tenantId: string) {
    return this.documentsService.findByClient(clientId, tenantId);
  }

  @Get('type/:type')
  findByType(@Param('type') type: DocumentType, @CurrentTenant() tenantId: string) {
    return this.documentsService.findByType(type, tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.documentsService.findOne(id, tenantId);
  }

  @Get(':id/download')
  async downloadDocument(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @Res() res: Response,
                                                                                                                                                                                                                                                            @Query('inline') inline?: string,
    @Query('filename') requestedFilename?: string
  ) {
    const { buffer, filename, mimeType } = await this.documentsService.downloadDocument(id, tenantId);
    
    const disposition = inline === 'true' ? 'inline' : 'attachment';
    // Use requested filename if provided, otherwise use stored filename
    const displayFilename = requestedFilename || filename;
    
    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `${disposition}; filename*=UTF-8''${encodeURIComponent(displayFilename)}`,
      'Content-Length': buffer.length,
      'X-Frame-Options': 'SAMEORIGIN',
      'Content-Security-Policy': "frame-ancestors 'self'",
    });
    
    res.send(buffer);
  }

  @Get(':id/url')
  async getDownloadUrl(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    const url = await this.documentsService.getDownloadUrl(id, tenantId);
    return { downloadUrl: url };
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDocumentDto: UpdateDocumentDto,
    @CurrentTenant() tenantId: string
  ) {
    return this.documentsService.updateDocument(id, updateDocumentDto as any, tenantId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.documentsService.removeDocument(id, tenantId);
  }
}
