import { MigrationInterface, QueryRunner } from "typeorm";

export class Cars1722594981759 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE cars (
                id varchar(255) NOT NULL,
                name varchar(255) NOT NULL,
                brand varchar(255) NOT NULL,
                model varchar(255) NOT NULL,
                year integer NOT NULL,
                fuel varchar(255) NOT NULL,
                transmission varchar(255) NOT NULL,
                price integer NOT NULL,
                color varchar(255) NOT NULL,
                mileage integer NOT NULL,
                description varchar(255) NOT NULL,
                image varchar(255) NOT NULL,
                status varchar(255) NOT NULL,
                created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
              ,
                PRIMARY KEY (id)
            )
            `
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("DROP TABLE cars", undefined);
  }
}
