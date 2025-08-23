import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { Readable } from 'stream';

@Injectable()
export class MinioService {
  private readonly logger = new Logger(MinioService.name);
  private minioClient: Minio.Client;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    this.minioClient = new Minio.Client({
      endPoint: this.configService.get('MINIO_ENDPOINT', 'localhost'),
      port: parseInt(this.configService.get('MINIO_PORT', '9000')),
      useSSL: this.configService.get('MINIO_USE_SSL', 'false') === 'true',
      accessKey: this.configService.get('MINIO_ACCESS_KEY', 'minio'),
      secretKey: this.configService.get('MINIO_SECRET_KEY', 'minio12345'),
    });

    this.bucketName = this.configService.get('MINIO_BUCKET_NAME', 'legal-documents');
    this.initializeBucket();
  }

  private async initializeBucket(): Promise<void> {
    try {
      const bucketExists = await this.minioClient.bucketExists(this.bucketName);
      if (!bucketExists) {
        await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
        this.logger.log(`Bucket '${this.bucketName}' created successfully`);
      }
    } catch (error) {
      this.logger.error(`Failed to initialize bucket: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async uploadFile(
    objectName: string,
    fileBuffer: Buffer,
    mimeType: string,
    metadata?: Record<string, string>
  ): Promise<string> {
    try {
      const stream = Readable.from(fileBuffer);
      await this.minioClient.putObject(
        this.bucketName,
        objectName,
        stream,
        fileBuffer.length,
        { 'Content-Type': mimeType, ...metadata }
      );
      
      this.logger.log(`File uploaded successfully: ${objectName}`);
      return objectName;
    } catch (error) {
      this.logger.error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw new Error(`File upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
 
  async downloadFile(objectName: string): Promise<Buffer> {
    try {
      const stream = await this.minioClient.getObject(this.bucketName, objectName);
      const chunks: Buffer[] = [];
      
      return new Promise((resolve, reject) => {
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
      });
    } catch (error) {
      this.logger.error(`Failed to download file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw new Error(`File download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteFile(objectName: string): Promise<void> {
    try {
      await this.minioClient.removeObject(this.bucketName, objectName);
      this.logger.log(`File deleted successfully: ${objectName}`);
    } catch (error) {
      this.logger.error(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw new Error(`File deletion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getFileUrl(objectName: string, expiresInSeconds: number = 3600): Promise<string> {
    try {
      return await this.minioClient.presignedGetObject(this.bucketName, objectName, expiresInSeconds);
    } catch (error) {
      this.logger.error(`Failed to generate file URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw new Error(`URL generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async fileExists(objectName: string): Promise<boolean> {
    try {
      await this.minioClient.statObject(this.bucketName, objectName);
      return true;
    } catch (error) {
      return false;
    }
  }
}
