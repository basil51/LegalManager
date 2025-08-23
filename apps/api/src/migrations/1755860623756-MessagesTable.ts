import { MigrationInterface, QueryRunner } from "typeorm";

export class MessagesTable1755860623756 implements MigrationInterface {
    name = 'MessagesTable1755860623756'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."messages_type_enum" AS ENUM('internal', 'client_communication', 'case_update', 'appointment_reminder', 'system_notification')`);
        await queryRunner.query(`CREATE TYPE "public"."messages_status_enum" AS ENUM('sent', 'delivered', 'read', 'failed')`);
        await queryRunner.query(`CREATE TABLE "messages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "subject" text NOT NULL, "content" text NOT NULL, "type" "public"."messages_type_enum" NOT NULL DEFAULT 'internal', "status" "public"."messages_status_enum" NOT NULL DEFAULT 'sent', "threadId" uuid, "parentMessageId" uuid, "caseId" uuid, "appointmentId" uuid, "clientId" uuid, "is_urgent" boolean NOT NULL DEFAULT false, "is_archived" boolean NOT NULL DEFAULT false, "read_at" TIMESTAMP WITH TIME ZONE, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "tenantId" uuid NOT NULL, "senderId" uuid NOT NULL, "recipientId" uuid NOT NULL, CONSTRAINT "PK_18325f38ae6de43878487eff986" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "messages" ADD CONSTRAINT "FK_809cf06e658568d5579aa335cb5" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "messages" ADD CONSTRAINT "FK_2db9cf2b3ca111742793f6c37ce" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "messages" ADD CONSTRAINT "FK_f548818d46a1315d4e1d5e62da5" FOREIGN KEY ("recipientId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_f548818d46a1315d4e1d5e62da5"`);
        await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_2db9cf2b3ca111742793f6c37ce"`);
        await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_809cf06e658568d5579aa335cb5"`);
        await queryRunner.query(`DROP TABLE "messages"`);
        await queryRunner.query(`DROP TYPE "public"."messages_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."messages_type_enum"`);
    }

}
