import {MigrationInterface, QueryRunner} from "typeorm";

export class Stub1630523158877 implements MigrationInterface {

    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`SET search_path TO ${process.env.POSTGRES_SCHEMA},public,postgis`)
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`SET search_path TO ${process.env.POSTGRES_SCHEMA},public,postgis`)
    }

}
