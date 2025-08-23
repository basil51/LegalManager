import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant } from './tenant.entity';
import { TenantContextService } from './tenant-context.service';
import { TenantContextInterceptor } from './tenant-context.interceptor';

@Module({
  imports: [TypeOrmModule.forFeature([Tenant])],
  providers: [TenantContextService, TenantContextInterceptor],
  exports: [TypeOrmModule, TenantContextService, TenantContextInterceptor],
})
export class TenantsModule {}
