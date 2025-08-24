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
    return await this.tenantContextService.withTenantContext<Case>(tenantId, async (): Promise<Case> => {
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
      const savedCase = await this.casesRepository.save(caseEntity) as unknown as Case;
      return savedCase;
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

  async update(id: string, updateCaseDto: any, tenantId: string): Promise<Case | null> {
    return await this.tenantContextService.withTenantContext(tenantId, async () => {
      // Convert date strings to Date objects if provided
      const processedDto: any = { ...updateCaseDto };
      if (processedDto.filing_date) {
        processedDto.filing_date = new Date(processedDto.filing_date);
      }
      if (processedDto.hearing_date) {
        processedDto.hearing_date = new Date(processedDto.hearing_date);
      }
      if (processedDto.clientId) {
        processedDto.client = { id: processedDto.clientId };
        delete processedDto.clientId;
      }
      if (processedDto.assignedLawyerId) {
        processedDto.assigned_lawyer = { id: processedDto.assignedLawyerId };
        delete processedDto.assignedLawyerId;
      }
      if (processedDto.courtId) {
        processedDto.court = { id: processedDto.courtId };
        delete processedDto.courtId;
      }
      
      await this.casesRepository.update(id, processedDto);
      return this.findOne(id, tenantId);
    });
  }

  async remove(id: string, tenantId: string): Promise<void> {
    return this.tenantContextService.withTenantContext(tenantId, async () => {
      await this.casesRepository.update(id, { is_active: false });
    });
  }
}
