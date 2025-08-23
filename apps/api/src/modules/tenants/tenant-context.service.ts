import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class TenantContextService {
  constructor(private dataSource: DataSource) {}

  /**
   * Set the current tenant context for RLS policies
   * This must be called before any database operations
   */
  async setTenantContext(tenantId: string): Promise<void> {
    await this.dataSource.query('SELECT set_current_tenant($1)', [tenantId]);
  }

  /**
   * Clear the current tenant context
   */
  async clearTenantContext(): Promise<void> {
    await this.dataSource.query('SELECT set_config(\'app.current_tenant_id\', NULL, false)');
  }

  /**
   * Get the current tenant ID from context
   */
  async getCurrentTenantId(): Promise<string | null> {
    const result = await this.dataSource.query('SELECT current_setting(\'app.current_tenant_id\', true) as tenant_id');
    return result[0]?.tenant_id || null;
  }

  /**
   * Execute a function within a specific tenant context
   */
  async withTenantContext<T>(tenantId: string, operation: () => Promise<T>): Promise<T> {
    await this.setTenantContext(tenantId);
    try {
      return await operation();
    } finally {
      await this.clearTenantContext();
    }
  }
}
