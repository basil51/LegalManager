import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Court } from './court.entity';
import { TenantContextService } from '../tenants/tenant-context.service';

@Injectable()
export class CourtsService {
  constructor(
    @InjectRepository(Court)
    private courtsRepository: Repository<Court>,
    private tenantContextService: TenantContextService,
  ) {}

  async create(createCourtDto: Partial<Court>, tenantId: string): Promise<Court> {
    return this.tenantContextService.withTenantContext(tenantId, async () => {
      const court = this.courtsRepository.create({
        ...createCourtDto,
        tenant: { id: tenantId },
      });
      return this.courtsRepository.save(court);
    });
  }

  async findAll(tenantId: string): Promise<Court[]> {
    return this.tenantContextService.withTenantContext(tenantId, async () => {
      return this.courtsRepository.find({
        where: { is_active: true },
        relations: ['tenant'],
      });
    });
  }

  async findOne(id: string, tenantId: string): Promise<Court | null> {
    return this.tenantContextService.withTenantContext(tenantId, async () => {
      return this.courtsRepository.findOne({
        where: { id, is_active: true },
        relations: ['tenant'],
      });
    });
  }

  async update(id: string, updateCourtDto: Partial<Court>, tenantId: string): Promise<Court | null> {
    return this.tenantContextService.withTenantContext(tenantId, async () => {
      await this.courtsRepository.update(id, updateCourtDto);
      return this.findOne(id, tenantId);
    });
  }

  async remove(id: string, tenantId: string): Promise<void> {
    return this.tenantContextService.withTenantContext(tenantId, async () => {
      await this.courtsRepository.update(id, { is_active: false });
    });
  }
}
