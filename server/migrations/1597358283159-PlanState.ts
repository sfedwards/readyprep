import { MigrationInterface, QueryRunner } from 'typeorm';

export class PlanState1597358283159 implements MigrationInterface {
  name = 'PlanState1597358283159';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "account" ADD "planState" character varying`,
    );
    await queryRunner.query(`ALTER TABLE "account" ADD "trialEnd" TIMESTAMP`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "account" DROP COLUMN "trialEnd"`);
    await queryRunner.query(`ALTER TABLE "account" DROP COLUMN "planState"`);
  }
}
