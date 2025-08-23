import { MigrationInterface, QueryRunner } from "typeorm";

export class AppointmentsAndReminders1755860165548 implements MigrationInterface {
    name = 'AppointmentsAndReminders1755860165548'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."appointments_type_enum" AS ENUM('consultation', 'court_hearing', 'client_meeting', 'document_review', 'phone_call', 'video_call', 'other')`);
        await queryRunner.query(`CREATE TYPE "public"."appointments_status_enum" AS ENUM('scheduled', 'confirmed', 'cancelled', 'completed', 'no_show')`);
        await queryRunner.query(`CREATE TABLE "appointments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" text NOT NULL, "description" text, "type" "public"."appointments_type_enum" NOT NULL DEFAULT 'other', "status" "public"."appointments_status_enum" NOT NULL DEFAULT 'scheduled', "scheduled_at" TIMESTAMP WITH TIME ZONE NOT NULL, "duration_minutes" integer NOT NULL DEFAULT '60', "location" text, "meeting_link" text, "notes" text, "is_recurring" boolean NOT NULL DEFAULT false, "recurrence_pattern" text, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "tenantId" uuid NOT NULL, "lawyerId" uuid NOT NULL, "clientId" uuid, "caseId" uuid, CONSTRAINT "PK_4a437a9a27e948726b8bb3e36ad" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."reminders_type_enum" AS ENUM('email', 'sms', 'push', 'calendar')`);
        await queryRunner.query(`CREATE TYPE "public"."reminders_status_enum" AS ENUM('pending', 'sent', 'failed', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "reminders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "public"."reminders_type_enum" NOT NULL DEFAULT 'email', "scheduled_at" TIMESTAMP WITH TIME ZONE NOT NULL, "status" "public"."reminders_status_enum" NOT NULL DEFAULT 'pending', "message" text, "sent_to" text, "sent_at" TIMESTAMP WITH TIME ZONE, "error_message" text, "minutes_before" integer NOT NULL DEFAULT '15', "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "tenantId" uuid NOT NULL, "appointmentId" uuid NOT NULL, "recipientId" uuid NOT NULL, CONSTRAINT "PK_38715fec7f634b72c6cf7ea4893" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_46e6a4182e96de9d4c1bba50604" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_aeb2705d8087922ab566053a7a0" FOREIGN KEY ("lawyerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_c4dbd8eb292b83b5dc67be3cf45" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_2736e5b12427c92454073cf8d27" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reminders" ADD CONSTRAINT "FK_c76fc4864d8de134ffbd13fa160" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reminders" ADD CONSTRAINT "FK_703c706a32d95cb09768753f553" FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reminders" ADD CONSTRAINT "FK_9acd06707cc4329ae203c4aae86" FOREIGN KEY ("recipientId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reminders" DROP CONSTRAINT "FK_9acd06707cc4329ae203c4aae86"`);
        await queryRunner.query(`ALTER TABLE "reminders" DROP CONSTRAINT "FK_703c706a32d95cb09768753f553"`);
        await queryRunner.query(`ALTER TABLE "reminders" DROP CONSTRAINT "FK_c76fc4864d8de134ffbd13fa160"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_2736e5b12427c92454073cf8d27"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_c4dbd8eb292b83b5dc67be3cf45"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_aeb2705d8087922ab566053a7a0"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_46e6a4182e96de9d4c1bba50604"`);
        await queryRunner.query(`DROP TABLE "reminders"`);
        await queryRunner.query(`DROP TYPE "public"."reminders_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."reminders_type_enum"`);
        await queryRunner.query(`DROP TABLE "appointments"`);
        await queryRunner.query(`DROP TYPE "public"."appointments_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."appointments_type_enum"`);
    }

}
