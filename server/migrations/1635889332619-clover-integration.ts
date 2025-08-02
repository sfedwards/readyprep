import { MigrationInterface, QueryRunner } from 'typeorm';

export class cloverIntegration1635889332619 implements MigrationInterface {
  name = 'cloverIntegration1635889332619';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "clover_token" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "accountId" uuid NOT NULL, "cloverMerchantId" character varying NOT NULL, "accessToken" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "version" integer NOT NULL, CONSTRAINT "PK_063b1904ec8fcefbbcebf013387" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "clover_pos" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "accountId" uuid NOT NULL, "locationId" uuid NOT NULL, "cloverMerchantId" character varying NOT NULL, "itemLinksId" uuid, "tokenId" uuid, CONSTRAINT "REL_858edbd73604dee7cbba29fab8" UNIQUE ("tokenId"), CONSTRAINT "PK_d38006959b7fb208f78ef61abad" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "clover_pos_item_link" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "posId" uuid NOT NULL, "itemId" uuid, "idInPos" character varying NOT NULL, CONSTRAINT "UQ_c5d6909b851ea9770dd9847cde5" UNIQUE ("posId", "idInPos"), CONSTRAINT "PK_e5f8e9274b3f984532e58eb1a8a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "clover_order" ("id" character varying NOT NULL, "orderId" text NOT NULL, CONSTRAINT "PK_c3c74f4908b0c017d056f776781" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`DROP INDEX "IDX_9cbce3a8e51827005afc6ec221"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_9cbce3a8e51827005afc6ec221" ON "inventory_log" ("locationId", "ingredientId", "time", "type") `,
    );
    await queryRunner.query(
      `ALTER TABLE "clover_token" ADD CONSTRAINT "FK_96aed0b910e43e31a8bfdec2052" FOREIGN KEY ("accountId") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "clover_pos" ADD CONSTRAINT "FK_031e4b15cc3118ae7c228a023c9" FOREIGN KEY ("accountId") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "clover_pos" ADD CONSTRAINT "FK_2d465cafb154c59b3c613f712c9" FOREIGN KEY ("locationId") REFERENCES "location"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "clover_pos" ADD CONSTRAINT "FK_9883155e48c900e7656fa7b3374" FOREIGN KEY ("itemLinksId") REFERENCES "clover_pos_item_link"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "clover_pos" ADD CONSTRAINT "FK_858edbd73604dee7cbba29fab87" FOREIGN KEY ("tokenId") REFERENCES "clover_token"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "clover_pos_item_link" ADD CONSTRAINT "FK_0783380a5131494cf61ce5091b6" FOREIGN KEY ("posId") REFERENCES "clover_pos"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "clover_pos_item_link" ADD CONSTRAINT "FK_45a5e94cd2645aa061e8c4eb6bc" FOREIGN KEY ("itemId") REFERENCES "menu_item"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "clover_pos_item_link" DROP CONSTRAINT "FK_45a5e94cd2645aa061e8c4eb6bc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "clover_pos_item_link" DROP CONSTRAINT "FK_0783380a5131494cf61ce5091b6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "clover_pos" DROP CONSTRAINT "FK_858edbd73604dee7cbba29fab87"`,
    );
    await queryRunner.query(
      `ALTER TABLE "clover_pos" DROP CONSTRAINT "FK_9883155e48c900e7656fa7b3374"`,
    );
    await queryRunner.query(
      `ALTER TABLE "clover_pos" DROP CONSTRAINT "FK_2d465cafb154c59b3c613f712c9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "clover_pos" DROP CONSTRAINT "FK_031e4b15cc3118ae7c228a023c9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "clover_token" DROP CONSTRAINT "FK_96aed0b910e43e31a8bfdec2052"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_9cbce3a8e51827005afc6ec221"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_9cbce3a8e51827005afc6ec221" ON "inventory_log" ("time", "locationId", "ingredientId", "type") `,
    );
    await queryRunner.query(`DROP TABLE "clover_order"`);
    await queryRunner.query(`DROP TABLE "clover_pos_item_link"`);
    await queryRunner.query(`DROP TABLE "clover_pos"`);
    await queryRunner.query(`DROP TABLE "clover_token"`);
  }
}
