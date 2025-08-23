import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../tenants/tenant-context.decorator';
import { SessionType, SessionStatus } from './session.entity';

@Controller('sessions')
@UseGuards(JwtAuthGuard)
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  create(@Body() createSessionDto: CreateSessionDto, @CurrentTenant() tenantId: string) {
    return this.sessionsService.create(createSessionDto, tenantId);
  }

  @Get()
  findAll(@CurrentTenant() tenantId: string) {
    return this.sessionsService.findAll(tenantId);
  }

  @Get('upcoming')
  findUpcoming(@CurrentTenant() tenantId: string) {
    return this.sessionsService.findUpcoming(tenantId);
  }

  @Get('status/:status')
  findByStatus(@Param('status') status: SessionStatus, @CurrentTenant() tenantId: string) {
    return this.sessionsService.findByStatus(status, tenantId);
  }

  @Get('type/:type')
  findByType(@Param('type') type: SessionType, @CurrentTenant() tenantId: string) {
    return this.sessionsService.findByType(type, tenantId);
  }

  @Get('case/:caseId')
  findByCase(@Param('caseId') caseId: string, @CurrentTenant() tenantId: string) {
    return this.sessionsService.findByCase(caseId, tenantId);
  }

  @Get('lawyer/:lawyerId')
  findByLawyer(@Param('lawyerId') lawyerId: string, @CurrentTenant() tenantId: string) {
    return this.sessionsService.findByLawyer(lawyerId, tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.sessionsService.findOne(id, tenantId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSessionDto: UpdateSessionDto, @CurrentTenant() tenantId: string) {
    return this.sessionsService.update(id, updateSessionDto, tenantId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.sessionsService.remove(id, tenantId);
  }
}
