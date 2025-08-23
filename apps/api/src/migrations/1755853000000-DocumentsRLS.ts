import { MigrationInterface, QueryRunner } from "typeorm";

export class DocumentsRLS1755853000000 implements MigrationInterface {
    name = 'DocumentsRLS1755853000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Enable RLS on documents table
        await queryRunner.query(`ALTER TABLE "documents" ENABLE ROW LEVEL SECURITY`);

        // Create RLS policy for documents table
        await queryRunner.query(`
            CREATE POLICY "documents_tenant_isolation" ON "documents"
            FOR ALL USING ("tenantId" = current_setting('app.current_tenant_id')::uuid)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop RLS policy
        await queryRunner.query(`DROP POLICY IF EXISTS "documents_tenant_isolation" ON "documents"`);

        // Disable RLS
        await queryRunner.query(`ALTER TABLE "documents" DISABLE ROW LEVEL SECURITY`);
    }
}
