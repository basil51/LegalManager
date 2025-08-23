import { MigrationInterface, QueryRunner } from "typeorm";

export class DocumentsTable1755852919655 implements MigrationInterface {
    name = 'DocumentsTable1755852919655'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."documents_type_enum" AS ENUM('contract', 'evidence', 'court_filing', 'correspondence', 'invoice', 'receipt', 'other')`);
        await queryRunner.query(`CREATE TABLE "documents" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "filename" text NOT NULL, "original_filename" text NOT NULL, "mime_type" text NOT NULL, "file_size" bigint NOT NULL, "storage_path" text NOT NULL, "title" text NOT NULL, "description" text, "type" "public"."documents_type_enum" NOT NULL DEFAULT 'other', "tags" text, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "tenantId" uuid NOT NULL, "caseId" uuid, "clientId" uuid, "uploadedById" uuid NOT NULL, CONSTRAINT "PK_ac51aa5181ee2036f5ca482857c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "documents" ADD CONSTRAINT "FK_60f16e580e8deb01244205a4359" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "documents" ADD CONSTRAINT "FK_84de0ffddf4e9d1724b15d0e245" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "documents" ADD CONSTRAINT "FK_d25850a33704227e018444f4e16" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "documents" ADD CONSTRAINT "FK_5aad3bc717a4f483887ec61dbc8" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "documents" DROP CONSTRAINT "FK_5aad3bc717a4f483887ec61dbc8"`);
        await queryRunner.query(`ALTER TABLE "documents" DROP CONSTRAINT "FK_d25850a33704227e018444f4e16"`);
        await queryRunner.query(`ALTER TABLE "documents" DROP CONSTRAINT "FK_84de0ffddf4e9d1724b15d0e245"`);
        await queryRunner.query(`ALTER TABLE "documents" DROP CONSTRAINT "FK_60f16e580e8deb01244205a4359"`);
        await queryRunner.query(`DROP TABLE "documents"`);
        await queryRunner.query(`DROP TYPE "public"."documents_type_enum"`);
    }

}
