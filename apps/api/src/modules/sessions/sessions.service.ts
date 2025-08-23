import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session, SessionType, SessionStatus } from './session.entity';
import { TenantContextService } from '../tenants/tenant-context.service';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session)
    private sessionsRepository: Repository<Session>,
    private tenantContextService: TenantContextService,
  ) {}

  async create(createSessionDto: Partial<Session>, tenantId: string): Promise<Session> {
    return this.tenantContextService.withTenantContext(tenantId, async () => {
      const session = this.sessionsRepository.create({
        ...createSessionDto,
        tenant: { id: tenantId },
      });
      return this.sessionsRepository.save(session);
    });
  }

  async findAll(tenantId: string): Promise<Session[]> {
    return this.tenantContextService.withTenantContext(tenantId, async () => {
      return this.sessionsRepository.find({
        where: { is_active: true },
        relations: ['tenant', 'case', 'court', 'assigned_lawyer'],
      });
    });
  }

  async findOne(id: string, tenantId: string): Promise<Session | null> {
    return this.tenantContextService.withTenantContext(tenantId, async () => {
      return this.sessionsRepository.findOne({
        where: { id, is_active: true },
        relations: ['tenant', 'case', 'court', 'assigned_lawyer'],
      });
    });
  }

  async findByStatus(status: SessionStatus, tenantId: string): Promise<Session[]> {
    return this.tenantContextService.withTenantContext(tenantId, async () => {
      return this.sessionsRepository.find({
        where: { status, is_active: true },
        relations: ['tenant', 'case', 'court', 'assigned_lawyer'],
      });
    });
  }

  async findByType(type: SessionType, tenantId: string): Promise<Session[]> {
    return this.tenantContextService.withTenantContext(tenantId, async () => {
      return this.sessionsRepository.find({
        where: { type, is_active: true },
        relations: ['tenant', 'case', 'court', 'assigned_lawyer'],
      });
    });
  }

  async findByCase(caseId: string, tenantId: string): Promise<Session[]> {
    return this.tenantContextService.withTenantContext(tenantId, async () => {
      return this.sessionsRepository.find({
        where: { case: { id: caseId }, is_active: true },
        relations: ['tenant', 'case', 'court', 'assigned_lawyer'],
      });
    });
  }

  async findByLawyer(lawyerId: string, tenantId: string): Promise<Session[]> {
    return this.tenantContextService.withTenantContext(tenantId, async () => {
      return this.sessionsRepository.find({
        where: { assigned_lawyer: { id: lawyerId }, is_active: true },
        relations: ['tenant', 'case', 'court', 'assigned_lawyer'],
      });
    });
  }

  async findUpcoming(tenantId: string): Promise<Session[]> {
    return this.tenantContextService.withTenantContext(tenantId, async () => {
      return this.sessionsRepository.find({
        where: { 
          scheduled_at: new Date(),
          status: SessionStatus.SCHEDULED,
          is_active: true 
        },
        relations: ['tenant', 'case', 'court', 'assigned_lawyer'],
        order: { scheduled_at: 'ASC' },
      });
    });
  }

  async update(id: string, updateSessionDto: Partial<Session>, tenantId: string): Promise<Session | null> {
    return this.tenantContextService.withTenantContext(tenantId, async () => {
      await this.sessionsRepository.update(id, updateSessionDto);
      return this.findOne(id, tenantId);
    });
  }

  async remove(id: string, tenantId: string): Promise<void> {
    return this.tenantContextService.withTenantContext(tenantId, async () => {
      await this.sessionsRepository.update(id, { is_active: false });
    });
  }
}
