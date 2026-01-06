import { MigrationInterface, QueryRunner } from 'typeorm';

export class TrustAccounts1755862000000 implements MigrationInterface {
  name = 'TrustAccounts1755862000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create trust_accounts table
    await queryRunner.query(`
      CREATE TABLE "trust_accounts" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenantId" uuid NOT NULL,
        "clientId" uuid NOT NULL,
        "caseId" uuid,
        "account_number" text NOT NULL,
        "bank_name" text,
        "bank_account_number" text,
        "routing_number" text,
        "balance" decimal(10,2) NOT NULL DEFAULT '0',
        "notes" text,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_trust_accounts" PRIMARY KEY ("id")
      )
    `);

    // Create unique index on account_number + tenantId
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_trust_accounts_account_number_tenant" 
      ON "trust_accounts" ("account_number", "tenantId")
    `);

    // Create trust_transactions table
    await queryRunner.query(`
      CREATE TYPE "public"."trust_transaction_type_enum" AS ENUM('deposit', 'withdrawal', 'transfer', 'fee', 'interest', 'adjustment')
    `);

    await queryRunner.query(`
      CREATE TABLE "trust_transactions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenantId" uuid NOT NULL,
        "trust_account_id" uuid NOT NULL,
        "caseId" uuid,
        "created_by_id" uuid NOT NULL,
        "transaction_type" "public"."trust_transaction_type_enum" NOT NULL DEFAULT 'deposit',
        "amount" decimal(10,2) NOT NULL,
        "description" text,
        "reference_number" text,
        "check_number" text,
        "transaction_date" date NOT NULL,
        "notes" text,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_trust_transactions" PRIMARY KEY ("id")
      )
    `);

    // Create indexes for trust_transactions
    await queryRunner.query(`
      CREATE INDEX "IDX_trust_transactions_account_date" 
      ON "trust_transactions" ("trust_account_id", "transaction_date")
    `);

    // Add foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "trust_accounts" 
      ADD CONSTRAINT "FK_trust_accounts_tenant" 
      FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "trust_accounts" 
      ADD CONSTRAINT "FK_trust_accounts_client" 
      FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "trust_accounts" 
      ADD CONSTRAINT "FK_trust_accounts_case" 
      FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "trust_transactions" 
      ADD CONSTRAINT "FK_trust_transactions_tenant" 
      FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "trust_transactions" 
      ADD CONSTRAINT "FK_trust_transactions_account" 
      FOREIGN KEY ("trust_account_id") REFERENCES "trust_accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "trust_transactions" 
      ADD CONSTRAINT "FK_trust_transactions_case" 
      FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "trust_transactions" 
      ADD CONSTRAINT "FK_trust_transactions_created_by" 
      FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraints
    await queryRunner.query(`ALTER TABLE "trust_transactions" DROP CONSTRAINT "FK_trust_transactions_created_by"`);
    await queryRunner.query(`ALTER TABLE "trust_transactions" DROP CONSTRAINT "FK_trust_transactions_case"`);
    await queryRunner.query(`ALTER TABLE "trust_transactions" DROP CONSTRAINT "FK_trust_transactions_account"`);
    await queryRunner.query(`ALTER TABLE "trust_transactions" DROP CONSTRAINT "FK_trust_transactions_tenant"`);
    await queryRunner.query(`ALTER TABLE "trust_accounts" DROP CONSTRAINT "FK_trust_accounts_case"`);
    await queryRunner.query(`ALTER TABLE "trust_accounts" DROP CONSTRAINT "FK_trust_accounts_client"`);
    await queryRunner.query(`ALTER TABLE "trust_accounts" DROP CONSTRAINT "FK_trust_accounts_tenant"`);

    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_trust_transactions_account_date"`);
    await queryRunner.query(`DROP INDEX "IDX_trust_accounts_account_number_tenant"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE "trust_transactions"`);
    await queryRunner.query(`DROP TYPE "public"."trust_transaction_type_enum"`);
    await queryRunner.query(`DROP TABLE "trust_accounts"`);
  }
}
