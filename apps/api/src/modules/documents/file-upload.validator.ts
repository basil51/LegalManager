import { BadRequestException } from '@nestjs/common';

// Allowed file types (MIME types)
const ALLOWED_MIME_TYPES = [
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  // Images
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  // Text
  'text/plain',
  'text/csv',
  // Archives
  'application/zip',
  'application/x-zip-compressed',
  'application/x-rar-compressed',
];

// Allowed file extensions
const ALLOWED_EXTENSIONS = [
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
  'jpg', 'jpeg', 'png', 'gif', 'webp',
  'txt', 'csv',
  'zip', 'rar',
];

// Maximum file size: 50MB
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB in bytes

export function validateFileUpload(file: Express.Multer.File): void {
  if (!file) {
    throw new BadRequestException('No file uploaded');
  }

  if (!file.buffer || file.buffer.length === 0) {
    throw new BadRequestException('File buffer is empty');
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    throw new BadRequestException(`File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }

  // Validate MIME type
  if (!file.mimetype || !ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    throw new BadRequestException(`File type ${file.mimetype} is not allowed. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}`);
  }

  // Validate file extension
  const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
  if (!fileExtension || !ALLOWED_EXTENSIONS.includes(fileExtension)) {
    throw new BadRequestException(`File extension .${fileExtension} is not allowed. Allowed extensions: ${ALLOWED_EXTENSIONS.join(', ')}`);
  }

  // Sanitize filename - remove path traversal attempts
  const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
  if (sanitizedFilename !== file.originalname) {
    // Log warning but allow (we'll use UUID anyway)
    console.warn(`Filename sanitized: ${file.originalname} -> ${sanitizedFilename}`);
  }

  // Additional security: Check for dangerous file patterns
  const dangerousPatterns = ['../', '..\\', '/etc/', 'C:\\', '<script', '<?php', 'javascript:'];
  const filenameLower = file.originalname.toLowerCase();
  if (dangerousPatterns.some(pattern => filenameLower.includes(pattern))) {
    throw new BadRequestException('Filename contains potentially dangerous characters');
  }
}
