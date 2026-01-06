import { MigrationInterface, QueryRunner } from 'typeorm';

export class TrustAccountsRLS1755862100000 implements MigrationInterface {
  name = 'TrustAccountsRLS1755862100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable RLS on trust_accounts table
    await queryRunner.query(`ALTER TABLE "trust_accounts" ENABLE ROW LEVEL SECURITY`);

    // Create RLS policy for trust_accounts table
    await queryRunner.query(`
      CREATE POLICY "trust_accounts_tenant_isolation" ON "trust_accounts"
      FOR ALL USING ("tenantId" = current_setting('app.current_tenant_id')::uuid)
    `);

    // Enable RLS on trust_transactions table
    await queryRunner.query(`ALTER TABLE "trust_transactions" ENABLE ROW LEVEL SECURITY`);

    // Create RLS policy for trust_transactions table
    await queryRunner.query(`
      CREATE POLICY "trust_transactions_tenant_isolation" ON "trust_transactions"
      FOR ALL USING ("tenantId" = current_setting('app.current_tenant_id')::uuid)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop RLS policies
    await queryRunner.query(`DROP POLICY IF EXISTS "trust_transactions_tenant_isolation" ON "trust_transactions"`);
    await queryRunner.query(`DROP POLICY IF EXISTS "trust_accounts_tenant_isolation" ON "trust_accounts"`);

    // Disable RLS
    await queryRunner.query(`ALTER TABLE "trust_transactions" DISABLE ROW LEVEL SECURITY`);
    await queryRunner.query(`ALTER TABLE "trust_accounts" DISABLE ROW LEVEL SECURITY`);
  }
}
