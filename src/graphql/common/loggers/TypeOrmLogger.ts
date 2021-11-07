import {AdvancedConsoleLogger, Logger, LoggerOptions, QueryRunner} from "typeorm";

export class TypeOrmLogger extends AdvancedConsoleLogger implements Logger {

    constructor(options?: LoggerOptions) {
        super(options);
    }

    logQuery(query: string, parameters?: any[], queryRunner?: QueryRunner) {
        const shortParameters = parameters?.map((p) => {
            if (p instanceof Buffer) {
                return new Buffer(0);
            }
            else return p;
        });
        super.logQuery(query, shortParameters, queryRunner);
    }
}