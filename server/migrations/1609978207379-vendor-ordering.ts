import { MigrationInterface, QueryRunner } from 'typeorm';

export class vendorOrdering1609978207379 implements MigrationInterface {
  name = 'vendorOrdering1609978207379';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "vendor_address" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "street1" character varying NOT NULL, "street2" character varying NOT NULL, "city" character varying NOT NULL, "state" character varying NOT NULL, "zip" character varying NOT NULL, "vendorId" uuid, CONSTRAINT "REL_53bce62b6aa30cb9c8e4c6e743" UNIQUE ("vendorId"), CONSTRAINT "PK_ae20cddf20aebaa785797ef1871" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "vendor_contact" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "email" character varying NOT NULL, "officePhone" character varying NOT NULL, "mobilePhone" character varying NOT NULL, "vendorId" uuid, CONSTRAINT "REL_4902def964a93d3cf0384e2c3a" UNIQUE ("vendorId"), CONSTRAINT "PK_e9bd678abfdeb8964f9eb9022ea" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "vendor_ordermethod_enum" AS ENUM('email', 'manual')`,
    );
    await queryRunner.query(
      `CREATE TABLE "vendor" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "locationId" uuid, "name" character varying NOT NULL, "accountNumber" character varying NOT NULL, "orderMethod" "vendor_ordermethod_enum" NOT NULL, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "version" integer NOT NULL, CONSTRAINT "PK_931a23f6231a57604f5a0e32780" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "invoice" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "locationId" uuid, "vendorId" uuid NOT NULL, "number" character varying NOT NULL, "date" date NOT NULL, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "version" integer NOT NULL, CONSTRAINT "PK_15d25c200d9bcd8a33f698daf18" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "invoice_item" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "invoiceId" uuid NOT NULL, "packId" uuid NOT NULL, "pricePaid" integer NOT NULL, "numPacks" integer NOT NULL, "inventoryLogId" uuid NOT NULL, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "version" integer NOT NULL, CONSTRAINT "REL_c3f097747765fa8d80655d7668" UNIQUE ("inventoryLogId"), CONSTRAINT "PK_621317346abdf61295516f3cb76" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "vendor_order" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "locationId" uuid, "vendorId" uuid NOT NULL, "invoiceId" uuid, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "version" integer NOT NULL, CONSTRAINT "PK_1f6be69b3697c35a9a1e8cf817f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "vendor_order_item" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "orderId" uuid NOT NULL, "packId" uuid NOT NULL, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "version" integer NOT NULL, CONSTRAINT "PK_fd35c1436325351bec756411e8c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "pack" ADD "vendorId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "pack" ADD "catalogNumber" character varying NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "account" ADD "isInSandboxMode" boolean DEFAULT true`,
    );
    await queryRunner.query(`DROP INDEX "IDX_9cbce3a8e51827005afc6ec221"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_9cbce3a8e51827005afc6ec221" ON "inventory_log" ("locationId", "ingredientId", "time", "type") `,
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_address" ADD CONSTRAINT "FK_53bce62b6aa30cb9c8e4c6e743d" FOREIGN KEY ("vendorId") REFERENCES "vendor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_contact" ADD CONSTRAINT "FK_4902def964a93d3cf0384e2c3a2" FOREIGN KEY ("vendorId") REFERENCES "vendor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "vendor" ADD CONSTRAINT "FK_1fece03332202696713a170e1b5" FOREIGN KEY ("locationId") REFERENCES "location"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "pack" ADD CONSTRAINT "FK_2bf0d2b3030966422cc7be93448" FOREIGN KEY ("vendorId") REFERENCES "vendor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoice" ADD CONSTRAINT "FK_1dd00b3f543e163c640e54bf70d" FOREIGN KEY ("locationId") REFERENCES "location"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoice" ADD CONSTRAINT "FK_f5585028c4661f295b5cf41eb7e" FOREIGN KEY ("vendorId") REFERENCES "vendor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoice_item" ADD CONSTRAINT "FK_553d5aac210d22fdca5c8d48ead" FOREIGN KEY ("invoiceId") REFERENCES "invoice"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoice_item" ADD CONSTRAINT "FK_4ffa51090cddc15f9e00aec09db" FOREIGN KEY ("packId") REFERENCES "pack"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoice_item" ADD CONSTRAINT "FK_c3f097747765fa8d80655d7668d" FOREIGN KEY ("inventoryLogId") REFERENCES "inventory_log"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_order" ADD CONSTRAINT "FK_8ac7dc5ba388d7d45d92b4e1cb8" FOREIGN KEY ("locationId") REFERENCES "location"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_order" ADD CONSTRAINT "FK_d770363e66c27742babd24dce11" FOREIGN KEY ("vendorId") REFERENCES "vendor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_order" ADD CONSTRAINT "FK_f3243ae4aed7893ce47a27d89b7" FOREIGN KEY ("invoiceId") REFERENCES "invoice"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_order_item" ADD CONSTRAINT "FK_11c0fdef6dec1660a5da0a9f06f" FOREIGN KEY ("orderId") REFERENCES "vendor_order"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_order_item" ADD CONSTRAINT "FK_44fa609f4d3aa2d553bfe4f0ddb" FOREIGN KEY ("packId") REFERENCES "pack"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "vendor_order_item" DROP CONSTRAINT "FK_44fa609f4d3aa2d553bfe4f0ddb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_order_item" DROP CONSTRAINT "FK_11c0fdef6dec1660a5da0a9f06f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_order" DROP CONSTRAINT "FK_f3243ae4aed7893ce47a27d89b7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_order" DROP CONSTRAINT "FK_d770363e66c27742babd24dce11"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_order" DROP CONSTRAINT "FK_8ac7dc5ba388d7d45d92b4e1cb8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoice_item" DROP CONSTRAINT "FK_c3f097747765fa8d80655d7668d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoice_item" DROP CONSTRAINT "FK_4ffa51090cddc15f9e00aec09db"`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoice_item" DROP CONSTRAINT "FK_553d5aac210d22fdca5c8d48ead"`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoice" DROP CONSTRAINT "FK_f5585028c4661f295b5cf41eb7e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoice" DROP CONSTRAINT "FK_1dd00b3f543e163c640e54bf70d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pack" DROP CONSTRAINT "FK_2bf0d2b3030966422cc7be93448"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vendor" DROP CONSTRAINT "FK_1fece03332202696713a170e1b5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_contact" DROP CONSTRAINT "FK_4902def964a93d3cf0384e2c3a2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_address" DROP CONSTRAINT "FK_53bce62b6aa30cb9c8e4c6e743d"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_9cbce3a8e51827005afc6ec221"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_9cbce3a8e51827005afc6ec221" ON "inventory_log" ("time", "locationId", "ingredientId", "type") `,
    );
    await queryRunner.query(
      `ALTER TABLE "account" ALTER COLUMN "isInSandboxMode" SET DEFAULT false`,
    );
    await queryRunner.query(`ALTER TABLE "pack" DROP COLUMN "catalogNumber"`);
    await queryRunner.query(`ALTER TABLE "pack" DROP COLUMN "vendorId"`);
    await queryRunner.query(`DROP TABLE "vendor_order_item"`);
    await queryRunner.query(`DROP TABLE "vendor_order"`);
    await queryRunner.query(`DROP TABLE "invoice_item"`);
    await queryRunner.query(`DROP TABLE "invoice"`);
    await queryRunner.query(`DROP TABLE "vendor"`);
    await queryRunner.query(`DROP TYPE "vendor_ordermethod_enum"`);
    await queryRunner.query(`DROP TABLE "vendor_contact"`);
    await queryRunner.query(`DROP TABLE "vendor_address"`);
  }
}
