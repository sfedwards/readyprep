import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialData1589494061065 implements MigrationInterface {
  name = 'InitialData1589494061065';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Roles
    await queryRunner.query(
      "INSERT INTO role (type) VALUES ('ACCOUNT_OWNER');",
    );

    // Base Units
    {
      const [{ id: baseVolumeUnitId }] = await queryRunner.query(
        "INSERT INTO unit (id,name,symbol,type,magnitude) VALUES (DEFAULT,'Milliliter','ml','VOLUME',1) RETURNING id;",
      );
      await queryRunner.query(
        `INSERT INTO unit_alias ("unitId",name) VALUES ('${baseVolumeUnitId}','milliliters');`,
      );
      await queryRunner.query(
        `INSERT INTO unit_alias ("unitId",name) VALUES ('${baseVolumeUnitId}','millilitres');`,
      );
      await queryRunner.query(
        `INSERT INTO unit_alias ("unitId",name) VALUES ('${baseVolumeUnitId}','milliliter');`,
      );
      await queryRunner.query(
        `INSERT INTO unit_alias ("unitId",name) VALUES ('${baseVolumeUnitId}','millilitre');`,
      );
      await queryRunner.query(
        `INSERT INTO unit_alias ("unitId",name) VALUES ('${baseVolumeUnitId}','ml');`,
      );
    }
    {
      const [{ id: baseWeightUnitId }] = await queryRunner.query(
        "INSERT INTO unit (id,name,symbol,type,magnitude) VALUES (DEFAULT,'Milligram','mg','WEIGHT',1) RETURNING id;",
      );
      await queryRunner.query(
        `INSERT INTO unit_alias ("unitId",name) VALUES ('${baseWeightUnitId}','milligrams');`,
      );
      await queryRunner.query(
        `INSERT INTO unit_alias ("unitId",name) VALUES ('${baseWeightUnitId}','milligram');`,
      );
      await queryRunner.query(
        `INSERT INTO unit_alias ("unitId",name) VALUES ('${baseWeightUnitId}','mg');`,
      );
    }
    {
      const [{ id: basePureUnitId }] = await queryRunner.query(
        "INSERT INTO unit (id,name,symbol,type,magnitude) VALUES (DEFAULT,'Count','ct','PURE',1) RETURNING id;",
      );
      await queryRunner.query(
        `INSERT INTO unit_alias ("unitId",name) VALUES ('${basePureUnitId}','count');`,
      );
      await queryRunner.query(
        `INSERT INTO unit_alias ("unitId",name) VALUES ('${basePureUnitId}','ct');`,
      );
    }

    // Volume units
    {
      const [{ id }] = await queryRunner.query(
        "INSERT INTO unit (id,name,symbol,type,magnitude) VALUES (DEFAULT,'Cup','cup','VOLUME',240) RETURNING id;",
      );
      await queryRunner.query(
        `INSERT INTO unit_alias ("unitId",name) VALUES ('${id}','cups');`,
      );
      await queryRunner.query(
        `INSERT INTO unit_alias ("unitId",name) VALUES ('${id}','cup');`,
      );
    }
    {
      const [{ id }] = await queryRunner.query(
        "INSERT INTO unit (id,name,symbol,type,magnitude) VALUES (DEFAULT,'Fluid Ounce','fl oz','VOLUME',29.5735296) RETURNING id;",
      );
      await queryRunner.query(
        `INSERT INTO unit_alias ("unitId",name) VALUES ('${id}','fluid ounce');`,
      );
      await queryRunner.query(
        `INSERT INTO unit_alias ("unitId",name) VALUES ('${id}','fl oz');`,
      );
    }
    {
      const [{ id }] = await queryRunner.query(
        "INSERT INTO unit (id,name,symbol,type,magnitude) VALUES (DEFAULT,'Gallon','gal','VOLUME',3785.41178) RETURNING id;",
      );
      await queryRunner.query(
        `INSERT INTO unit_alias ("unitId",name) VALUES ('${id}','gallons');`,
      );
      await queryRunner.query(
        `INSERT INTO unit_alias ("unitId",name) VALUES ('${id}','gallon');`,
      );
      await queryRunner.query(
        `INSERT INTO unit_alias ("unitId",name) VALUES ('${id}','gal');`,
      );
    }
    {
      const [{ id }] = await queryRunner.query(
        "INSERT INTO unit (id,name,symbol,type,magnitude) VALUES (DEFAULT,'Liter','L','VOLUME',1000) RETURNING id;",
      );
      await queryRunner.query(
        `INSERT INTO unit_alias ("unitId",name) VALUES ('${id}','liters');`,
      );
      await queryRunner.query(
        `INSERT INTO unit_alias ("unitId",name) VALUES ('${id}','litres');`,
      );
      await queryRunner.query(
        `INSERT INTO unit_alias ("unitId",name) VALUES ('${id}','liter');`,
      );
      await queryRunner.query(
        `INSERT INTO unit_alias ("unitId",name) VALUES ('${id}','litre');`,
      );
      await queryRunner.query(
        `INSERT INTO unit_alias ("unitId",name) VALUES ('${id}','l');`,
      );
    }
    {
      const [{ id }] = await queryRunner.query(
        "INSERT INTO unit (id,name,symbol,type,magnitude) VALUES (DEFAULT,'Pint','pt','VOLUME',473.176473) RETURNING id;",
      );
      await queryRunner.query(
        `INSERT INTO unit_alias ("unitId",name) VALUES ('${id}','pints');`,
      );
      await queryRunner.query(
        `INSERT INTO unit_alias ("unitId",name) VALUES ('${id}','pint');`,
      );
      await queryRunner.query(
        `INSERT INTO unit_alias ("unitId",name) VALUES ('${id}','pt');`,
      );
    }
    {
      const [{ id }] = await queryRunner.query(
        "INSERT INTO unit (id,name,symbol,type,magnitude) VALUES (DEFAULT,'Quart','qt','VOLUME',946.352946) RETURNING id;",
      );
      await queryRunner.query(
        `INSERT INTO unit_alias ("unitId",name) VALUES ('${id}','quarts');`,
      );
      await queryRunner.query(
        `INSERT INTO unit_alias ("unitId",name) VALUES ('${id}','quart');`,
      );
      await queryRunner.query(
        `INSERT INTO unit_alias ("unitId",name) VALUES ('${id}','qt');`,
      );
    }
    {
      const [{ id }] = await queryRunner.query(
        "INSERT INTO unit (id,name,symbol,type,magnitude) VALUES (DEFAULT,'Tablespoon','tbsp','VOLUME',15) RETURNING id;",
      );
      await queryRunner.query(
        `INSERT INTO unit_alias ("unitId",name) VALUES ('${id}','tablespoons');`,
      );
      await queryRunner.query(
        `INSERT INTO unit_alias ("unitId",name) VALUES ('${id}','tablespoon');`,
      );
      await queryRunner.query(
        `INSERT INTO unit_alias ("unitId",name) VALUES ('${id}','tbsp');`,
      );
      await queryRunner.query(
        `INSERT INTO unit_alias ("unitId",name) VALUES ('${id}','tbsp');`,
      );
      await queryRunner.query(
        `INSERT INTO unit_alias ("unitId",name) VALUES ('${id}','tbs');`,
      );
    }
    {
      const [{ id }] = await queryRunner.query(
        "INSERT INTO unit (id,name,symbol,type,magnitude) VALUES (DEFAULT,'Teaspoon','tsp','VOLUME',5) RETURNING id;",
      );
      await queryRunner.query(
        `INSERT INTO unit_alias ("unitId",name) VALUES ('${id}','teaspoons');`,
      );
      await queryRunner.query(
        `INSERT INTO unit_alias ("unitId",name) VALUES ('${id}','teaspoon');`,
      );
      await queryRunner.query(
        `INSERT INTO unit_alias ("unitId",name) VALUES ('${id}','tsps');`,
      );
      await queryRunner.query(
        `INSERT INTO unit_alias ("unitId",name) VALUES ('${id}','tsp');`,
      );
    }

    // Weight units
    {
      const [{ id }] = await queryRunner.query(
        "INSERT INTO unit (id,name,symbol,type,magnitude) VALUES (DEFAULT,'Gram','g','WEIGHT',1000) RETURNING id;",
      );
      await queryRunner.query(
        `INSERT INTO unit_alias ("unitId",name) VALUES ('${id}','grams');`,
      );
      await queryRunner.query(
        `INSERT INTO unit_alias ("unitId",name) VALUES ('${id}','gram');`,
      );
      await queryRunner.query(
        `INSERT INTO unit_alias ("unitId",name) VALUES ('${id}','g');`,
      );
    }
    {
      const [{ id }] = await queryRunner.query(
        "INSERT INTO unit (id,name,symbol,type,magnitude) VALUES (DEFAULT,'Kilogram','kg','WEIGHT',1000000) RETURNING id;",
      );
      await queryRunner.query(
        `INSERT INTO unit_alias ("unitId",name) VALUES ('${id}','kilograms');`,
      );
      await queryRunner.query(
        `INSERT INTO unit_alias ("unitId",name) VALUES ('${id}','kilogram');`,
      );
      await queryRunner.query(
        `INSERT INTO unit_alias ("unitId",name) VALUES ('${id}','kg');`,
      );
    }
    {
      const [{ id }] = await queryRunner.query(
        "INSERT INTO unit (id,name,symbol,type,magnitude) VALUES (DEFAULT,'Pound','lb','WEIGHT',453592.37) RETURNING id;",
      );
      await queryRunner.query(
        `INSERT INTO unit_alias ("unitId",name) VALUES ('${id}','pounds');`,
      );
      await queryRunner.query(
        `INSERT INTO unit_alias ("unitId",name) VALUES ('${id}','pound');`,
      );
      await queryRunner.query(
        `INSERT INTO unit_alias ("unitId",name) VALUES ('${id}','lb');`,
      );
      await queryRunner.query(
        `INSERT INTO unit_alias ("unitId",name) VALUES ('${id}','lbs');`,
      );
      await queryRunner.query(
        `INSERT INTO unit_alias ("unitId",name) VALUES ('${id}','lbf');`,
      );
      await queryRunner.query(
        `INSERT INTO unit_alias ("unitId",name) VALUES ('${id}','lbm');`,
      );
    }
    {
      const [{ id }] = await queryRunner.query(
        "INSERT INTO unit (id,name,symbol,type,magnitude) VALUES (DEFAULT,'Ounce','oz','WEIGHT',28349.5231) RETURNING id;",
      );
      await queryRunner.query(
        `INSERT INTO unit_alias ("unitId",name) VALUES ('${id}','ounces');`,
      );
      await queryRunner.query(
        `INSERT INTO unit_alias ("unitId",name) VALUES ('${id}','ounce');`,
      );
      await queryRunner.query(
        `INSERT INTO unit_alias ("unitId",name) VALUES ('${id}','oz');`,
      );
    }

    // Pure units
    {
      const [{ id }] = await queryRunner.query(
        "INSERT INTO unit (id,name,symbol,type,magnitude) VALUES (DEFAULT,'12 units','dozen','PURE',12) RETURNING id;",
      );
      await queryRunner.query(
        `INSERT INTO unit_alias ("unitId",name) VALUES ('${id}','dozens');`,
      );
      await queryRunner.query(
        `INSERT INTO unit_alias ("unitId",name) VALUES ('${id}','dozen');`,
      );
    }
    {
      const [{ id }] = await queryRunner.query(
        "INSERT INTO unit (id,name,symbol,type,magnitude) VALUES (DEFAULT,'Each','ea','PURE',1) RETURNING id;",
      );
      await queryRunner.query(
        `INSERT INTO unit_alias ("unitId",name) VALUES ('${id}','each');`,
      );
      await queryRunner.query(
        `INSERT INTO unit_alias ("unitId",name) VALUES ('${id}','ea');`,
      );
    }
  }

  public async down(): Promise<void> {
    //
  }
}
