import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards,
  Query,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { CurrentTenant } from '../tenants/tenant-context.decorator';
import { Message, MessageType } from './message.entity';

@ApiTags('messages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @ApiOperation({ summary: 'Send a new message' })
  @ApiResponse({ status: 201, description: 'Message sent successfully' })
  async create(
    @Body() createMessageDto: CreateMessageDto,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<Message> {
    return this.messagesService.create(createMessageDto, user.id, tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all messages for the current user' })
  @ApiResponse({ status: 200, description: 'Messages retrieved successfully' })
  async findAll(
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<Message[]> {
    return this.messagesService.findAll(tenantId, user.id);
  }

  @Get('inbox')
  @ApiOperation({ summary: 'Get inbox messages' })
  @ApiResponse({ status: 200, description: 'Inbox messages retrieved successfully' })
  async findInbox(
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<Message[]> {
    return this.messagesService.findInbox(tenantId, user.id);
  }

  @Get('sent')
  @ApiOperation({ summary: 'Get sent messages' })
  @ApiResponse({ status: 200, description: 'Sent messages retrieved successfully' })
  async findSent(
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<Message[]> {
    return this.messagesService.findSent(tenantId, user.id);
  }

  @Get('unread')
  @ApiOperation({ summary: 'Get unread messages' })
  @ApiResponse({ status: 200, description: 'Unread messages retrieved successfully' })
  async findUnread(
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<Message[]> {
    return this.messagesService.findUnread(tenantId, user.id);
  }

  @Get('unread/count')
  @ApiOperation({ summary: 'Get unread message count' })
  @ApiResponse({ status: 200, description: 'Unread count retrieved successfully' })
  async getUnreadCount(
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<{ count: number }> {
    const count = await this.messagesService.getUnreadCount(tenantId, user.id);
    return { count };
  }

  @Get('thread/:threadId')
  @ApiOperation({ summary: 'Get messages in a thread' })
  @ApiResponse({ status: 200, description: 'Thread messages retrieved successfully' })
  async findThread(
    @Param('threadId') threadId: string,
    @CurrentTenant() tenantId: string,
  ): Promise<Message[]> {
    return this.messagesService.findThread(threadId, tenantId);
  }

  @Get('type/:type')
  @ApiOperation({ summary: 'Get messages by type' })
  @ApiResponse({ status: 200, description: 'Messages by type retrieved successfully' })
  async findByType(
    @Param('type') type: MessageType,
    @CurrentTenant() tenantId: string,
  ): Promise<Message[]> {
    return this.messagesService.findByType(type, tenantId);
  }

  @Get('urgent')
  @ApiOperation({ summary: 'Get urgent messages' })
  @ApiResponse({ status: 200, description: 'Urgent messages retrieved successfully' })
  async findUrgent(
    @CurrentTenant() tenantId: string,
  ): Promise<Message[]> {
    return this.messagesService.findUrgent(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific message' })
  @ApiResponse({ status: 200, description: 'Message retrieved successfully' })
  async findOne(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
  ): Promise<Message | null> {
    return this.messagesService.findOne(id, tenantId);
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark message as read' })
  @ApiResponse({ status: 200, description: 'Message marked as read' })
  async markAsRead(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<Message | null> {
    return this.messagesService.markAsRead(id, tenantId, user.id);
  }

  @Patch('thread/:threadId/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark all messages in thread as read' })
  @ApiResponse({ status: 200, description: 'Thread marked as read' })
  async markThreadAsRead(
    @Param('threadId') threadId: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<void> {
    return this.messagesService.markThreadAsRead(threadId, tenantId, user.id);
  }

  @Patch(':id/archive')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Archive a message' })
  @ApiResponse({ status: 200, description: 'Message archived' })
  async archive(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<void> {
    return this.messagesService.archive(id, tenantId, user.id);
  }

  @Patch(':id/unarchive')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unarchive a message' })
  @ApiResponse({ status: 200, description: 'Message unarchived' })
  async unarchive(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<void> {
    return this.messagesService.unarchive(id, tenantId, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a message' })
  @ApiResponse({ status: 200, description: 'Message updated successfully' })
  async update(
    @Param('id') id: string,
    @Body() updateMessageDto: UpdateMessageDto,
    @CurrentTenant() tenantId: string,
  ): Promise<Message | null> {
    return this.messagesService.update(id, updateMessageDto, tenantId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a message' })
  @ApiResponse({ status: 204, description: 'Message deleted successfully' })
  async remove(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
  ): Promise<void> {
    return this.messagesService.remove(id, tenantId);
  }
}
