import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Message, MessageType, MessageStatus } from './message.entity';
import { TenantContextService } from '../tenants/tenant-context.service';

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);

  constructor(
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
    private tenantContextService: TenantContextService,
  ) {}

  async create(createMessageDto: Partial<Message>, senderId: string, tenantId: string): Promise<Message> {
    return this.tenantContextService.withTenantContext(tenantId, async () => {
      const message = this.messagesRepository.create({
        ...createMessageDto,
        sender: { id: senderId },
        tenant: { id: tenantId },
        threadId: createMessageDto.threadId || createMessageDto.parentMessageId || undefined,
      });
      
      return this.messagesRepository.save(message);
    });
  }

  async findAll(tenantId: string, userId?: string): Promise<Message[]> {
    return this.tenantContextService.withTenantContext(tenantId, async () => {
      const where: any = { is_active: true };
      
      if (userId) {
        where.recipient = { id: userId };
      }

      return this.messagesRepository.find({
        where,
        relations: ['tenant', 'sender', 'recipient'],
        order: { created_at: 'DESC' },
      });
    });
  }

  async findInbox(tenantId: string, userId: string): Promise<Message[]> {
    return this.tenantContextService.withTenantContext(tenantId, async () => {
      return this.messagesRepository.find({
        where: { 
          recipient: { id: userId }, 
          is_active: true,
          is_archived: false 
        },
        relations: ['tenant', 'sender', 'recipient'],
        order: { created_at: 'DESC' },
      });
    });
  }

  async findSent(tenantId: string, userId: string): Promise<Message[]> {
    return this.tenantContextService.withTenantContext(tenantId, async () => {
      return this.messagesRepository.find({
        where: { 
          sender: { id: userId }, 
          is_active: true 
        },
        relations: ['tenant', 'sender', 'recipient'],
        order: { created_at: 'DESC' },
      });
    });
  }

  async findUnread(tenantId: string, userId: string): Promise<Message[]> {
    return this.tenantContextService.withTenantContext(tenantId, async () => {
      return this.messagesRepository.find({
        where: { 
          recipient: { id: userId }, 
          status: MessageStatus.SENT,
          is_active: true,
          is_archived: false 
        },
        relations: ['tenant', 'sender', 'recipient'],
        order: { created_at: 'DESC' },
      });
    });
  }

  async findThread(threadId: string, tenantId: string): Promise<Message[]> {
    return this.tenantContextService.withTenantContext(tenantId, async () => {
      return this.messagesRepository.find({
        where: { 
          threadId, 
          is_active: true 
        },
        relations: ['tenant', 'sender', 'recipient'],
        order: { created_at: 'ASC' },
      });
    });
  }

  async findOne(id: string, tenantId: string): Promise<Message | null> {
    return this.tenantContextService.withTenantContext(tenantId, async () => {
      return this.messagesRepository.findOne({
        where: { id, is_active: true },
        relations: ['tenant', 'sender', 'recipient'],
      });
    });
  }

  async markAsRead(id: string, tenantId: string, userId: string): Promise<Message | null> {
    return this.tenantContextService.withTenantContext(tenantId, async () => {
      const message = await this.messagesRepository.findOne({
        where: { 
          id, 
          recipient: { id: userId },
          is_active: true 
        },
      });

      if (!message) {
        throw new NotFoundException('Message not found');
      }

      await this.messagesRepository.update(id, {
        status: MessageStatus.READ,
        read_at: new Date(),
      });

      return this.findOne(id, tenantId);
    });
  }

  async markThreadAsRead(threadId: string, tenantId: string, userId: string): Promise<void> {
    return this.tenantContextService.withTenantContext(tenantId, async () => {
      await this.messagesRepository.update(
        { 
          threadId, 
          recipient: { id: userId },
          status: MessageStatus.SENT,
          is_active: true 
        },
        {
          status: MessageStatus.READ,
          read_at: new Date(),
        }
      );
    });
  }

  async archive(id: string, tenantId: string, userId: string): Promise<void> {
    return this.tenantContextService.withTenantContext(tenantId, async () => {
      const message = await this.messagesRepository.findOne({
        where: { 
          id, 
          recipient: { id: userId },
          is_active: true 
        },
      });

      if (!message) {
        throw new NotFoundException('Message not found');
      }

      await this.messagesRepository.update(id, { is_archived: true });
    });
  }

  async unarchive(id: string, tenantId: string, userId: string): Promise<void> {
    return this.tenantContextService.withTenantContext(tenantId, async () => {
      const message = await this.messagesRepository.findOne({
        where: { 
          id, 
          recipient: { id: userId },
          is_active: true 
        },
      });

      if (!message) {
        throw new NotFoundException('Message not found');
      }

      await this.messagesRepository.update(id, { is_archived: false });
    });
  }

  async update(id: string, updateMessageDto: Partial<Message>, tenantId: string): Promise<Message | null> {
    return this.tenantContextService.withTenantContext(tenantId, async () => {
      await this.messagesRepository.update(id, updateMessageDto);
      return this.findOne(id, tenantId);
    });
  }

  async remove(id: string, tenantId: string): Promise<void> {
    return this.tenantContextService.withTenantContext(tenantId, async () => {
      await this.messagesRepository.update(id, { is_active: false });
    });
  }

  async getUnreadCount(tenantId: string, userId: string): Promise<number> {
    return this.tenantContextService.withTenantContext(tenantId, async () => {
      return this.messagesRepository.count({
        where: { 
          recipient: { id: userId }, 
          status: MessageStatus.SENT,
          is_active: true,
          is_archived: false 
        },
      });
    });
  }

  async findByType(type: MessageType, tenantId: string): Promise<Message[]> {
    return this.tenantContextService.withTenantContext(tenantId, async () => {
      return this.messagesRepository.find({
        where: { type, is_active: true },
        relations: ['tenant', 'sender', 'recipient'],
        order: { created_at: 'DESC' },
      });
    });
  }

  async findUrgent(tenantId: string): Promise<Message[]> {
    return this.tenantContextService.withTenantContext(tenantId, async () => {
      return this.messagesRepository.find({
        where: { 
          is_urgent: true, 
          is_active: true,
          is_archived: false 
        },
        relations: ['tenant', 'sender', 'recipient'],
        order: { created_at: 'DESC' },
      });
    });
  }
}
