import {DefaultNamingStrategy, NamingStrategyInterface, Table} from "typeorm";
import {snakeCase} from "typeorm/util/StringUtils";

/**
 * Entity naming strategy that removes the 'Entity' suffixes.
 */
export class EntityNamingStrategy extends DefaultNamingStrategy implements NamingStrategyInterface {

    /**
     * Trim the 'Entity' suffix of a string.
     *
     * @param input The input string
     */
    trimEntity(input: Table | string): string {
        const name = input instanceof Table ? input.name : input;
        return snakeCase(name).split("_").length > 1 ? name.replace(/Entity$/, "") : name;
    }

    tableName(targetName: string, userSpecifiedName: string | undefined): string {
        return super.tableName(this.trimEntity(targetName), userSpecifiedName);
    }

}