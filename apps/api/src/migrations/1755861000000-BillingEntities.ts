import { MigrationInterface, QueryRunner } from 'typeorm';

export class BillingEntities1755861000000 implements MigrationInterface {
  name = 'BillingEntities1755861000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create invoice_items table
    await queryRunner.query(`
      CREATE TYPE "public"."item_type_enum" AS ENUM('service', 'expense', 'disbursement', 'fee', 'other')
    `);

    await queryRunner.query(`
      CREATE TABLE "invoice_items" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenantId" uuid NOT NULL,
        "invoiceId" uuid NOT NULL,
        "description" text NOT NULL,
        "type" "public"."item_type_enum" NOT NULL DEFAULT 'service',
        "quantity" decimal(10,2) NOT NULL,
        "unit_price" decimal(10,2) NOT NULL,
        "total_amount" decimal(10,2) NOT NULL,
        "notes" text,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_invoice_items" PRIMARY KEY ("id")
      )
    `);

    // Create invoices table
    await queryRunner.query(`
      CREATE TYPE "public"."invoice_status_enum" AS ENUM('draft', 'sent', 'paid', 'overdue', 'cancelled', 'partially_paid')
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."payment_method_enum" AS ENUM('cash', 'check', 'bank_transfer', 'credit_card', 'online_payment', 'other')
    `);

    await queryRunner.query(`
      CREATE TABLE "invoices" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenantId" uuid NOT NULL,
        "caseId" uuid,
        "clientId" uuid NOT NULL,
        "createdById" uuid NOT NULL,
        "invoice_number" text NOT NULL,
        "title" text NOT NULL,
        "description" text,
        "status" "public"."invoice_status_enum" NOT NULL DEFAULT 'draft',
        "subtotal" decimal(10,2) NOT NULL DEFAULT '0',
        "tax_amount" decimal(10,2) NOT NULL DEFAULT '0',
        "discount_amount" decimal(10,2) NOT NULL DEFAULT '0',
        "total_amount" decimal(10,2) NOT NULL DEFAULT '0',
        "paid_amount" decimal(10,2) NOT NULL DEFAULT '0',
        "balance_due" decimal(10,2) NOT NULL DEFAULT '0',
        "issue_date" date NOT NULL,
        "due_date" date NOT NULL,
        "paid_date" date,
        "payment_method" "public"."payment_method_enum",
        "payment_reference" text,
        "notes" text,
        "terms_and_conditions" text,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_invoices" PRIMARY KEY ("id")
      )
    `);

    // Create payments table
    await queryRunner.query(`
      CREATE TYPE "public"."payment_status_enum" AS ENUM('pending', 'completed', 'failed', 'cancelled', 'refunded')
    `);

    await queryRunner.query(`
      CREATE TABLE "payments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenantId" uuid NOT NULL,
        "invoiceId" uuid NOT NULL,
        "clientId" uuid NOT NULL,
        "processedById" uuid,
        "payment_number" text NOT NULL,
        "amount" decimal(10,2) NOT NULL,
        "status" "public"."payment_status_enum" NOT NULL DEFAULT 'pending',
        "payment_method" text NOT NULL,
        "reference_number" text,
        "transaction_id" text,
        "payment_date" date NOT NULL,
        "notes" text,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_payments" PRIMARY KEY ("id")
      )
    `);

    // Add foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "invoice_items" 
      ADD CONSTRAINT "FK_invoice_items_tenant" 
      FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "invoice_items" 
      ADD CONSTRAINT "FK_invoice_items_invoice" 
      FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "invoices" 
      ADD CONSTRAINT "FK_invoices_tenant" 
      FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "invoices" 
      ADD CONSTRAINT "FK_invoices_case" 
      FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "invoices" 
      ADD CONSTRAINT "FK_invoices_client" 
      FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "invoices" 
      ADD CONSTRAINT "FK_invoices_created_by" 
      FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "payments" 
      ADD CONSTRAINT "FK_payments_tenant" 
      FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "payments" 
      ADD CONSTRAINT "FK_payments_invoice" 
      FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "payments" 
      ADD CONSTRAINT "FK_payments_client" 
      FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "payments" 
      ADD CONSTRAINT "FK_payments_processed_by" 
      FOREIGN KEY ("processedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    // Add RLS policies
    await queryRunner.query(`
      ALTER TABLE "invoice_items" ENABLE ROW LEVEL SECURITY
    `);

    await queryRunner.query(`
      ALTER TABLE "invoices" ENABLE ROW LEVEL SECURITY
    `);

    await queryRunner.query(`
      ALTER TABLE "payments" ENABLE ROW LEVEL SECURITY
    `);

    await queryRunner.query(`
      CREATE POLICY "invoice_items_tenant_isolation" ON "invoice_items"
      FOR ALL USING ("tenantId" = current_setting('app.current_tenant_id')::uuid)
    `);

    await queryRunner.query(`
      CREATE POLICY "invoices_tenant_isolation" ON "invoices"
      FOR ALL USING ("tenantId" = current_setting('app.current_tenant_id')::uuid)
    `);

    await queryRunner.query(`
      CREATE POLICY "payments_tenant_isolation" ON "payments"
      FOR ALL USING ("tenantId" = current_setting('app.current_tenant_id')::uuid)
    `);

    // Add indexes
    await queryRunner.query(`
      CREATE INDEX "IDX_invoice_items_tenant" ON "invoice_items" ("tenantId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_invoice_items_invoice" ON "invoice_items" ("invoiceId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_invoices_tenant" ON "invoices" ("tenantId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_invoices_client" ON "invoices" ("clientId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_invoices_case" ON "invoices" ("caseId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_invoices_status" ON "invoices" ("status")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_payments_tenant" ON "payments" ("tenantId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_payments_invoice" ON "payments" ("invoiceId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_payments_client" ON "payments" ("clientId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_payments_status" ON "payments" ("status")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_payments_status"`);
    await queryRunner.query(`DROP INDEX "IDX_payments_client"`);
    await queryRunner.query(`DROP INDEX "IDX_payments_invoice"`);
    await queryRunner.query(`DROP INDEX "IDX_payments_tenant"`);
    await queryRunner.query(`DROP INDEX "IDX_invoices_status"`);
    await queryRunner.query(`DROP INDEX "IDX_invoices_case"`);
    await queryRunner.query(`DROP INDEX "IDX_invoices_client"`);
    await queryRunner.query(`DROP INDEX "IDX_invoices_tenant"`);
    await queryRunner.query(`DROP INDEX "IDX_invoice_items_invoice"`);
    await queryRunner.query(`DROP INDEX "IDX_invoice_items_tenant"`);

    // Drop RLS policies
    await queryRunner.query(`DROP POLICY "payments_tenant_isolation" ON "payments"`);
    await queryRunner.query(`DROP POLICY "invoices_tenant_isolation" ON "invoices"`);
    await queryRunner.query(`DROP POLICY "invoice_items_tenant_isolation" ON "invoice_items"`);

    // Drop RLS
    await queryRunner.query(`ALTER TABLE "payments" DISABLE ROW LEVEL SECURITY`);
    await queryRunner.query(`ALTER TABLE "invoices" DISABLE ROW LEVEL SECURITY`);
    await queryRunner.query(`ALTER TABLE "invoice_items" DISABLE ROW LEVEL SECURITY`);

    // Drop foreign keys
    await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "FK_payments_processed_by"`);
    await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "FK_payments_client"`);
    await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "FK_payments_invoice"`);
    await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "FK_payments_tenant"`);
    await queryRunner.query(`ALTER TABLE "invoices" DROP CONSTRAINT "FK_invoices_created_by"`);
    await queryRunner.query(`ALTER TABLE "invoices" DROP CONSTRAINT "FK_invoices_client"`);
    await queryRunner.query(`ALTER TABLE "invoices" DROP CONSTRAINT "FK_invoices_case"`);
    await queryRunner.query(`ALTER TABLE "invoices" DROP CONSTRAINT "FK_invoices_tenant"`);
    await queryRunner.query(`ALTER TABLE "invoice_items" DROP CONSTRAINT "FK_invoice_items_invoice"`);
    await queryRunner.query(`ALTER TABLE "invoice_items" DROP CONSTRAINT "FK_invoice_items_tenant"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE "payments"`);
    await queryRunner.query(`DROP TABLE "invoices"`);
    await queryRunner.query(`DROP TABLE "invoice_items"`);

    // Drop enums
    await queryRunner.query(`DROP TYPE "public"."payment_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."payment_method_enum"`);
    await queryRunner.query(`DROP TYPE "public"."invoice_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."item_type_enum"`);
  }
}
