import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsActiveToSessions1755852109283 implements MigrationInterface {
    name = 'AddIsActiveToSessions1755852109283'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sessions" ADD "is_active" boolean NOT NULL DEFAULT true`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "is_active"`);
    }

}
