import { MigrationInterface, QueryRunner } from "typeorm";

export class CoreEntities1755851382615 implements MigrationInterface {
    name = 'CoreEntities1755851382615'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "clients" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" text NOT NULL, "first_name" text NOT NULL, "last_name" text NOT NULL, "phone" text, "address" text, "notes" text, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "tenantId" uuid NOT NULL, CONSTRAINT "PK_f1ab7cf3a5714dbc6bb4e1c28a4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_3e0f9b53604afb2bc3009612c1" ON "clients" ("email", "tenantId") `);
        await queryRunner.query(`CREATE TABLE "courts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" text NOT NULL, "address" text, "phone" text, "website" text, "notes" text, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "tenantId" uuid NOT NULL, CONSTRAINT "PK_948a5d356c3083f3237ecbf9897" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."cases_status_enum" AS ENUM('open', 'closed', 'pending', 'on_hold')`);
        await queryRunner.query(`CREATE TYPE "public"."cases_type_enum" AS ENUM('civil', 'criminal', 'family', 'corporate', 'real_estate', 'other')`);
        await queryRunner.query(`CREATE TABLE "cases" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "case_number" text NOT NULL, "title" text NOT NULL, "description" text, "status" "public"."cases_status_enum" NOT NULL DEFAULT 'open', "type" "public"."cases_type_enum" NOT NULL DEFAULT 'other', "filing_date" date, "hearing_date" date, "notes" text, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "tenantId" uuid NOT NULL, "clientId" uuid NOT NULL, "courtId" uuid, "assignedLawyerId" uuid NOT NULL, CONSTRAINT "PK_264acb3048c240fb89aa34626db" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."sessions_type_enum" AS ENUM('hearing', 'deposition', 'mediation', 'settlement', 'trial', 'other')`);
        await queryRunner.query(`CREATE TYPE "public"."sessions_status_enum" AS ENUM('scheduled', 'completed', 'cancelled', 'postponed')`);
        await queryRunner.query(`CREATE TABLE "sessions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" text NOT NULL, "description" text, "type" "public"."sessions_type_enum" NOT NULL DEFAULT 'other', "status" "public"."sessions_status_enum" NOT NULL DEFAULT 'scheduled', "scheduled_at" TIMESTAMP WITH TIME ZONE NOT NULL, "completed_at" TIMESTAMP WITH TIME ZONE, "location" text, "notes" text, "outcome" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "tenantId" uuid NOT NULL, "caseId" uuid NOT NULL, "courtId" uuid, "assignedLawyerId" uuid NOT NULL, CONSTRAINT "PK_3238ef96f18b355b671619111bc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "clients" ADD CONSTRAINT "FK_78708145905b919ba16977437b4" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "courts" ADD CONSTRAINT "FK_bea0616a797f71bdc929d846eb1" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cases" ADD CONSTRAINT "FK_116b161b749f7b4d1e4ddc5f801" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cases" ADD CONSTRAINT "FK_fbf8265e90624733f68ff5333ad" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cases" ADD CONSTRAINT "FK_d8c682921f7413bfa00ca6042aa" FOREIGN KEY ("courtId") REFERENCES "courts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cases" ADD CONSTRAINT "FK_4cdcdbe2f2c41da3303138584c2" FOREIGN KEY ("assignedLawyerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD CONSTRAINT "FK_3c03d45d6b55202b9563107dc68" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD CONSTRAINT "FK_dad75d9cd2c56e3764a0bbc4bce" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD CONSTRAINT "FK_40df8508a408679e251bd4fcd9d" FOREIGN KEY ("courtId") REFERENCES "courts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD CONSTRAINT "FK_05bfbc2aacf335a75492fb4340b" FOREIGN KEY ("assignedLawyerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sessions" DROP CONSTRAINT "FK_05bfbc2aacf335a75492fb4340b"`);
        await queryRunner.query(`ALTER TABLE "sessions" DROP CONSTRAINT "FK_40df8508a408679e251bd4fcd9d"`);
        await queryRunner.query(`ALTER TABLE "sessions" DROP CONSTRAINT "FK_dad75d9cd2c56e3764a0bbc4bce"`);
        await queryRunner.query(`ALTER TABLE "sessions" DROP CONSTRAINT "FK_3c03d45d6b55202b9563107dc68"`);
        await queryRunner.query(`ALTER TABLE "cases" DROP CONSTRAINT "FK_4cdcdbe2f2c41da3303138584c2"`);
        await queryRunner.query(`ALTER TABLE "cases" DROP CONSTRAINT "FK_d8c682921f7413bfa00ca6042aa"`);
        await queryRunner.query(`ALTER TABLE "cases" DROP CONSTRAINT "FK_fbf8265e90624733f68ff5333ad"`);
        await queryRunner.query(`ALTER TABLE "cases" DROP CONSTRAINT "FK_116b161b749f7b4d1e4ddc5f801"`);
        await queryRunner.query(`ALTER TABLE "courts" DROP CONSTRAINT "FK_bea0616a797f71bdc929d846eb1"`);
        await queryRunner.query(`ALTER TABLE "clients" DROP CONSTRAINT "FK_78708145905b919ba16977437b4"`);
        await queryRunner.query(`DROP TABLE "sessions"`);
        await queryRunner.query(`DROP TYPE "public"."sessions_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."sessions_type_enum"`);
        await queryRunner.query(`DROP TABLE "cases"`);
        await queryRunner.query(`DROP TYPE "public"."cases_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."cases_status_enum"`);
        await queryRunner.query(`DROP TABLE "courts"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3e0f9b53604afb2bc3009612c1"`);
        await queryRunner.query(`DROP TABLE "clients"`);
    }

}
