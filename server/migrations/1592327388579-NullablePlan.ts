import { MigrationInterface, QueryRunner } from 'typeorm';

export class NullablePlan1592327388579 implements MigrationInterface {
  name = 'NullablePlan1592327388579';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "account" ALTER COLUMN "plan" DROP NOT NULL`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "account" ALTER COLUMN "plan" DROP DEFAULT`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "account" ALTER COLUMN "plan" SET DEFAULT 'FREE'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "account" ALTER COLUMN "plan" SET NOT NULL`,
      undefined,
    );
  }
}
