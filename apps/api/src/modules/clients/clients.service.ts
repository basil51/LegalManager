import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './client.entity';
import { TenantContextService } from '../tenants/tenant-context.service';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private clientsRepository: Repository<Client>,
    private tenantContextService: TenantContextService,
  ) {}

  async create(createClientDto: Partial<Client>, tenantId: string): Promise<Client> {
    return this.tenantContextService.withTenantContext(tenantId, async () => {
      const client = this.clientsRepository.create({
        ...createClientDto,
        tenant: { id: tenantId },
      });
      return this.clientsRepository.save(client);
    });
  }

  async findAll(tenantId: string): Promise<Client[]> {
    return this.tenantContextService.withTenantContext(tenantId, async () => {
      return this.clientsRepository.find({
        relations: ['tenant'],
      });
    });
  }

  async findOne(id: string, tenantId: string): Promise<Client | null> {
    return this.tenantContextService.withTenantContext(tenantId, async () => {
      return this.clientsRepository.findOne({
        where: { id, is_active: true },
        relations: ['tenant'],
      });
    });
  }

  async update(id: string, updateClientDto: Partial<Client>, tenantId: string): Promise<Client | null> {
    return this.tenantContextService.withTenantContext(tenantId, async () => {
      await this.clientsRepository.update(id, updateClientDto);
      return this.findOne(id, tenantId);
    });
  }

  async remove(id: string, tenantId: string): Promise<void> {
    return this.tenantContextService.withTenantContext(tenantId, async () => {
      await this.clientsRepository.update(id, { is_active: false });
    });
  }
}
