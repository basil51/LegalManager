import { MigrationInterface, QueryRunner } from "typeorm";

export class RLSPolicies1755851500000 implements MigrationInterface {
    name = 'RLSPolicies1755851500000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Enable RLS on all tenant-scoped tables
        await queryRunner.query(`ALTER TABLE "clients" ENABLE ROW LEVEL SECURITY`);
        await queryRunner.query(`ALTER TABLE "courts" ENABLE ROW LEVEL SECURITY`);
        await queryRunner.query(`ALTER TABLE "cases" ENABLE ROW LEVEL SECURITY`);
        await queryRunner.query(`ALTER TABLE "sessions" ENABLE ROW LEVEL SECURITY`);
        await queryRunner.query(`ALTER TABLE "users" ENABLE ROW LEVEL SECURITY`);

        // Create RLS policies for clients table
        await queryRunner.query(`
            CREATE POLICY "clients_tenant_isolation" ON "clients"
            FOR ALL USING ("tenantId" = current_setting('app.current_tenant_id')::uuid)
        `);

        // Create RLS policies for courts table
        await queryRunner.query(`
            CREATE POLICY "courts_tenant_isolation" ON "courts"
            FOR ALL USING ("tenantId" = current_setting('app.current_tenant_id')::uuid)
        `);

        // Create RLS policies for cases table
        await queryRunner.query(`
            CREATE POLICY "cases_tenant_isolation" ON "cases"
            FOR ALL USING ("tenantId" = current_setting('app.current_tenant_id')::uuid)
        `);

        // Create RLS policies for sessions table
        await queryRunner.query(`
            CREATE POLICY "sessions_tenant_isolation" ON "sessions"
            FOR ALL USING ("tenantId" = current_setting('app.current_tenant_id')::uuid)
        `);

        // Create RLS policies for users table
        await queryRunner.query(`
            CREATE POLICY "users_tenant_isolation" ON "users"
            FOR ALL USING ("tenantId" = current_setting('app.current_tenant_id')::uuid)
        `);

        // Create function to set current tenant
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION set_current_tenant(tenant_id uuid)
            RETURNS void AS $$
            BEGIN
                PERFORM set_config('app.current_tenant_id', tenant_id::text, false);
            END;
            $$ LANGUAGE plpgsql;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop RLS policies
        await queryRunner.query(`DROP POLICY IF EXISTS "clients_tenant_isolation" ON "clients"`);
        await queryRunner.query(`DROP POLICY IF EXISTS "courts_tenant_isolation" ON "courts"`);
        await queryRunner.query(`DROP POLICY IF EXISTS "cases_tenant_isolation" ON "cases"`);
        await queryRunner.query(`DROP POLICY IF EXISTS "sessions_tenant_isolation" ON "sessions"`);
        await queryRunner.query(`DROP POLICY IF EXISTS "users_tenant_isolation" ON "users"`);

        // Disable RLS
        await queryRunner.query(`ALTER TABLE "clients" DISABLE ROW LEVEL SECURITY`);
        await queryRunner.query(`ALTER TABLE "courts" DISABLE ROW LEVEL SECURITY`);
        await queryRunner.query(`ALTER TABLE "cases" DISABLE ROW LEVEL SECURITY`);
        await queryRunner.query(`ALTER TABLE "sessions" DISABLE ROW LEVEL SECURITY`);
        await queryRunner.query(`ALTER TABLE "users" DISABLE ROW LEVEL SECURITY`);

        // Drop function
        await queryRunner.query(`DROP FUNCTION IF EXISTS set_current_tenant(uuid)`);
    }
}
