import { MigrationInterface, QueryRunner } from 'typeorm';

export class SquareIntegration1602890030512 implements MigrationInterface {
  name = 'SquareIntegration1602890030512';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "location" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "accountId" uuid NOT NULL, "name" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_876d7bdba03c72251ec4c2dc827" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "square_token" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "accountId" uuid NOT NULL, "squareMerchantId" character varying NOT NULL, "accessToken" character varying NOT NULL, "expiresAt" TIMESTAMP NOT NULL, "refreshToken" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "version" integer NOT NULL, CONSTRAINT "PK_0a074a2ce908dfecdde1eb06386" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "square_pos" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "accountId" uuid NOT NULL, "locationId" uuid NOT NULL, "squareLocationId" character varying NOT NULL, "itemLinksId" uuid, "tokenId" uuid, CONSTRAINT "REL_2a391dcdbbc8513303f469bde6" UNIQUE ("tokenId"), CONSTRAINT "PK_7590681ad214fa8367dc5476713" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "square_pos_item_link" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "posId" uuid NOT NULL, "itemId" uuid, "idInPos" character varying NOT NULL, CONSTRAINT "UQ_058ff5de9f3b0d6601b9dd84165" UNIQUE ("posId", "idInPos"), CONSTRAINT "PK_411a006f7d0071150983b85979f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "event" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" character varying NOT NULL, "dedupeId" character varying, "time" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "data" json NOT NULL, "processedAt" TIMESTAMP, "error" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "version" integer NOT NULL, CONSTRAINT "UQ_39648421c535cdaa9cfdc54c539" UNIQUE ("type", "dedupeId"), CONSTRAINT "PK_30c2f3bbaf6d34a55f8ae6e4614" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_85ccec18da75b3a7bef5617a72" ON "event" ("time") WHERE "processedAt" IS NULL`,
    );
    await queryRunner.query(
      `CREATE TABLE "order" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "locationId" uuid NOT NULL, CONSTRAINT "PK_1031171c13130102495201e3e20" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "order_item" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "orderId" uuid NOT NULL, "itemId" uuid, "quantity" integer NOT NULL, CONSTRAINT "PK_d01158fe15b1ead5c26fd7f4e90" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "inventory_log" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "time" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "locationId" uuid NOT NULL, "ingredientId" uuid NOT NULL, "type" character varying NOT NULL, "value" numeric(20,10) NOT NULL, "orderItemId" uuid, CONSTRAINT "PK_92195bfa4eaa5c9e798021900f7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9cbce3a8e51827005afc6ec221" ON "inventory_log" ("locationId", "ingredientId", "time", "type") `,
    );
    await queryRunner.query(
      `CREATE TABLE "job_schedule" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "schedule" character varying NOT NULL, "lastRanAt" TIMESTAMP, "nextRunAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "version" integer NOT NULL, CONSTRAINT "UQ_113f8856a1bd336b4fb092335f4" UNIQUE ("name"), CONSTRAINT "PK_9e741b6be1199a16ccd3d131c47" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "job" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "dedupeId" character varying, "time" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "data" json NOT NULL, "processedAt" TIMESTAMP, "error" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "version" integer NOT NULL, CONSTRAINT "PK_98ab1c14ff8d1cf80d18703b92f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1b071ef0d6c52b30597c6c9ba9" ON "job" ("time") WHERE "processedAt" IS NULL`,
    );
    await queryRunner.query(
      `CREATE TABLE "order_item_inventory" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "orderItemId" uuid NOT NULL, "inventoryLogId" uuid NOT NULL, CONSTRAINT "PK_9b92b31b6027f08fd4551ed5e86" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "square_order" ("id" character varying NOT NULL, "orderId" text NOT NULL, CONSTRAINT "PK_5b273d2f070c9edaf3f12dada07" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "production" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "locationId" uuid NOT NULL, "date" date NOT NULL, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "version" integer NOT NULL, CONSTRAINT "PK_722753196a878fa7473f0381da3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "production_item" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "productionId" uuid NOT NULL, "prepIngredientId" uuid NOT NULL, "actualInventoryId" uuid, "actualPrepId" uuid NOT NULL, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "version" integer NOT NULL, CONSTRAINT "REL_70c5cab10795abc6df0d570db0" UNIQUE ("actualInventoryId"), CONSTRAINT "REL_982014c308507e56f6700f7fd1" UNIQUE ("actualPrepId"), CONSTRAINT "PK_7b438a127ef97969b986acc94db" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "menu_item" ADD "type" character varying NOT NULL DEFAULT 'REGULAR'`,
    );
    await queryRunner.query(
      `ALTER TABLE "account" ADD "hasNewPosItems" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "location" ADD CONSTRAINT "FK_577d8ec46947f236300944a5537" FOREIGN KEY ("accountId") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "square_token" ADD CONSTRAINT "FK_9ee393ad798cb240a75b8bc69ac" FOREIGN KEY ("accountId") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "square_pos" ADD CONSTRAINT "FK_3505f1d007b2841030b74f2a117" FOREIGN KEY ("accountId") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "square_pos" ADD CONSTRAINT "FK_0d9030bb94a93dbf247b5de4df4" FOREIGN KEY ("locationId") REFERENCES "location"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "square_pos" ADD CONSTRAINT "FK_31269dc910739e9958ad32c4ede" FOREIGN KEY ("itemLinksId") REFERENCES "square_pos_item_link"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "square_pos" ADD CONSTRAINT "FK_2a391dcdbbc8513303f469bde6a" FOREIGN KEY ("tokenId") REFERENCES "square_token"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "square_pos_item_link" ADD CONSTRAINT "FK_1773c0aa4675b4450b07cb19054" FOREIGN KEY ("posId") REFERENCES "square_pos"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "square_pos_item_link" ADD CONSTRAINT "FK_f1f797be874bad8093a76c26175" FOREIGN KEY ("itemId") REFERENCES "menu_item"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" ADD CONSTRAINT "FK_d8e60777de8c68a2107831d16fa" FOREIGN KEY ("locationId") REFERENCES "location"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item" ADD CONSTRAINT "FK_646bf9ece6f45dbe41c203e06e0" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item" ADD CONSTRAINT "FK_e03f3ed4dab80a3bf3eca50babc" FOREIGN KEY ("itemId") REFERENCES "menu_item"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "inventory_log" ADD CONSTRAINT "FK_18826dd7c759c4cb420f8bc7dfd" FOREIGN KEY ("locationId") REFERENCES "location"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "inventory_log" ADD CONSTRAINT "FK_10d2aa6e4d5323ac87b295802d8" FOREIGN KEY ("ingredientId") REFERENCES "ingredient"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "inventory_log" ADD CONSTRAINT "FK_4432414ca568b3870e5f245be7c" FOREIGN KEY ("orderItemId") REFERENCES "order_item"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item_inventory" ADD CONSTRAINT "FK_5e45967ee69d4572103e02e3a5c" FOREIGN KEY ("orderItemId") REFERENCES "order_item"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item_inventory" ADD CONSTRAINT "FK_847b392edba5eef999c83776d94" FOREIGN KEY ("inventoryLogId") REFERENCES "inventory_log"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "production" ADD CONSTRAINT "FK_0021af6928828c72d580b32019d" FOREIGN KEY ("locationId") REFERENCES "location"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "production_item" ADD CONSTRAINT "FK_472256835537821bb599e770ccc" FOREIGN KEY ("productionId") REFERENCES "production"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "production_item" ADD CONSTRAINT "FK_63d4f51058a672e0555922c40e6" FOREIGN KEY ("prepIngredientId") REFERENCES "ingredient"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "production_item" ADD CONSTRAINT "FK_70c5cab10795abc6df0d570db03" FOREIGN KEY ("actualInventoryId") REFERENCES "inventory_log"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "production_item" ADD CONSTRAINT "FK_982014c308507e56f6700f7fd13" FOREIGN KEY ("actualPrepId") REFERENCES "inventory_log"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "production_item" DROP CONSTRAINT "FK_982014c308507e56f6700f7fd13"`,
    );
    await queryRunner.query(
      `ALTER TABLE "production_item" DROP CONSTRAINT "FK_70c5cab10795abc6df0d570db03"`,
    );
    await queryRunner.query(
      `ALTER TABLE "production_item" DROP CONSTRAINT "FK_63d4f51058a672e0555922c40e6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "production_item" DROP CONSTRAINT "FK_472256835537821bb599e770ccc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "production" DROP CONSTRAINT "FK_0021af6928828c72d580b32019d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item_inventory" DROP CONSTRAINT "FK_847b392edba5eef999c83776d94"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item_inventory" DROP CONSTRAINT "FK_5e45967ee69d4572103e02e3a5c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "inventory_log" DROP CONSTRAINT "FK_4432414ca568b3870e5f245be7c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "inventory_log" DROP CONSTRAINT "FK_10d2aa6e4d5323ac87b295802d8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "inventory_log" DROP CONSTRAINT "FK_18826dd7c759c4cb420f8bc7dfd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item" DROP CONSTRAINT "FK_e03f3ed4dab80a3bf3eca50babc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item" DROP CONSTRAINT "FK_646bf9ece6f45dbe41c203e06e0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" DROP CONSTRAINT "FK_d8e60777de8c68a2107831d16fa"`,
    );
    await queryRunner.query(
      `ALTER TABLE "square_pos_item_link" DROP CONSTRAINT "FK_f1f797be874bad8093a76c26175"`,
    );
    await queryRunner.query(
      `ALTER TABLE "square_pos_item_link" DROP CONSTRAINT "FK_1773c0aa4675b4450b07cb19054"`,
    );
    await queryRunner.query(
      `ALTER TABLE "square_pos" DROP CONSTRAINT "FK_2a391dcdbbc8513303f469bde6a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "square_pos" DROP CONSTRAINT "FK_31269dc910739e9958ad32c4ede"`,
    );
    await queryRunner.query(
      `ALTER TABLE "square_pos" DROP CONSTRAINT "FK_0d9030bb94a93dbf247b5de4df4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "square_pos" DROP CONSTRAINT "FK_3505f1d007b2841030b74f2a117"`,
    );
    await queryRunner.query(
      `ALTER TABLE "square_token" DROP CONSTRAINT "FK_9ee393ad798cb240a75b8bc69ac"`,
    );
    await queryRunner.query(
      `ALTER TABLE "location" DROP CONSTRAINT "FK_577d8ec46947f236300944a5537"`,
    );
    await queryRunner.query(
      `ALTER TABLE "account" DROP COLUMN "hasNewPosItems"`,
    );
    await queryRunner.query(`ALTER TABLE "menu_item" DROP COLUMN "type"`);
    await queryRunner.query(`DROP TABLE "production_item"`);
    await queryRunner.query(`DROP TABLE "production"`);
    await queryRunner.query(`DROP TABLE "square_order"`);
    await queryRunner.query(`DROP TABLE "order_item_inventory"`);
    await queryRunner.query(`DROP INDEX "IDX_1b071ef0d6c52b30597c6c9ba9"`);
    await queryRunner.query(`DROP TABLE "job"`);
    await queryRunner.query(`DROP TABLE "job_schedule"`);
    await queryRunner.query(`DROP INDEX "IDX_9cbce3a8e51827005afc6ec221"`);
    await queryRunner.query(`DROP TABLE "inventory_log"`);
    await queryRunner.query(`DROP TABLE "order_item"`);
    await queryRunner.query(`DROP TABLE "order"`);
    await queryRunner.query(`DROP INDEX "IDX_85ccec18da75b3a7bef5617a72"`);
    await queryRunner.query(`DROP TABLE "event"`);
    await queryRunner.query(`DROP TABLE "square_pos_item_link"`);
    await queryRunner.query(`DROP TABLE "square_pos"`);
    await queryRunner.query(`DROP TABLE "square_token"`);
    await queryRunner.query(`DROP TABLE "location"`);
  }
}
