import { MigrationInterface, QueryRunner } from "typeorm";

export class Users1722594304243 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE user (
                id varchar(255) NOT NULL,
                name varchar(255) NOT NULL,
                email varchar(255) NOT NULL,
                 password varchar(255) NOT NULL,
                phone varchar(255) NOT NULL,
                 verified boolean NOT NULL DEFAULT false
              ,

                created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
              ,
                PRIMARY KEY (id)
            )
            `
    ),
      undefined;
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("DROP TABLE users", undefined);
  }
}
