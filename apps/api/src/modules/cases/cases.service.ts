import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Case, CaseStatus, CaseType } from './case.entity';
import { TenantContextService } from '../tenants/tenant-context.service';

@Injectable()
export class CasesService {
  constructor(
    @InjectRepository(Case)
    private casesRepository: Repository<Case>,
    private tenantContextService: TenantContextService,
  ) {}

  async create(createCaseDto: any, tenantId: string): Promise<Case> {
    return this.tenantContextService.withTenantContext(tenantId, async () => {
      // Convert date strings to Date objects if provided
      const processedDto = {
        ...createCaseDto,
        filing_date: createCaseDto.filing_date ? new Date(createCaseDto.filing_date) : null,
        hearing_date: createCaseDto.hearing_date ? new Date(createCaseDto.hearing_date) : null,
        tenant: { id: tenantId },
        client: { id: createCaseDto.clientId },
        assigned_lawyer: { id: createCaseDto.assignedLawyerId },
        court: createCaseDto.courtId ? { id: createCaseDto.courtId } : null,
      };
      
      const caseEntity = this.casesRepository.create(processedDto);
      return this.casesRepository.save(caseEntity);
    });
  }

  async findAll(tenantId: string): Promise<Case[]> {
    return this.tenantContextService.withTenantContext(tenantId, async () => {
      return this.casesRepository.find({
        where: { is_active: true },
        relations: ['tenant', 'client', 'court', 'assigned_lawyer'],
      });
    });
  } 

  async findOne(id: string, tenantId: string): Promise<Case | null> {
    return this.tenantContextService.withTenantContext(tenantId, async () => {
      return this.casesRepository.findOne({
        where: { id, is_active: true },
        relations: ['tenant', 'client', 'court', 'assigned_lawyer'],
      });
    });
  }

  async findByStatus(status: CaseStatus, tenantId: string): Promise<Case[]> {
    return this.tenantContextService.withTenantContext(tenantId, async () => {
      return this.casesRepository.find({
        where: { status, is_active: true },
        relations: ['tenant', 'client', 'court', 'assigned_lawyer'],
      });
    });
  }

  async findByType(type: CaseType, tenantId: string): Promise<Case[]> {
    return this.tenantContextService.withTenantContext(tenantId, async () => {
      return this.casesRepository.find({
        where: { type, is_active: true },
        relations: ['tenant', 'client', 'court', 'assigned_lawyer'],
      });
    });
  }

  async findByLawyer(lawyerId: string, tenantId: string): Promise<Case[]> {
    return this.tenantContextService.withTenantContext(tenantId, async () => {
      return this.casesRepository.find({
        where: { assigned_lawyer: { id: lawyerId }, is_active: true },
        relations: ['tenant', 'client', 'court', 'assigned_lawyer'],
      });
    });
  }

  async update(id: string, updateCaseDto: Partial<Case>, tenantId: string): Promise<Case | null> {
    return this.tenantContextService.withTenantContext(tenantId, async () => {
      await this.casesRepository.update(id, updateCaseDto);
      return this.findOne(id, tenantId);
    });
  }

  async remove(id: string, tenantId: string): Promise<void> {
    return this.tenantContextService.withTenantContext(tenantId, async () => {
      await this.casesRepository.update(id, { is_active: false });
    });
  }
}
